import Joi from '@hapi/joi';

import Transaction from '../../data/database/models/Transaction';
import { PaymentRefund, COFRecurringTransaction } from '../../data/database';
import UnenrolledCard from '../../data/database/models/UnenrolledCard';
// import TransactionStatus from '../../data/database/models/TransactionStatus';
import moment from 'moment';
import { ITransactionRepository } from './ITransactionRepository';
import { fenigePaymentClient3dsVerify, fenigePaymentFinalize, fenigePaymentRefund } from './../fenige/thirdParty';
import { config } from '../../configuration';
// import dateFormat from 'dateformat';
const Sequelize = require('sequelize');
const { QueryTypes } = require('sequelize');

const sequelize = new Sequelize(config.DBName, config.DBUser, config.DBPassword, {
  host: config.DBHost,
  dialect: 'mysql'
});
export class TransactionService {
  constructor(private readonly transactionRepository: ITransactionRepository) { }

  async createTransaction(
    adax_uuid: string,
    customer_details_id: number,
    request_uuid: string,
    term_uuid: string,
    first_name: string,
    last_name: string,
    email: string,
    address_ip: string,
    amount: number,
    fees: number,
    currency: string,
    card_number: string,
    expiry_date: string,
    cvc2: string,
    transaction_status: string,
    auto_clear: boolean,
    redirect_url: string,
    crypto_transfer: boolean,
    kyc_delayed: boolean,
    wallet?: string,
  ): Promise<any> {

      const schema = Joi.object({
          adax_uuid: Joi.string().required(),
          customer_details_id: Joi.number().required(),
          request_uuid: Joi.string().required(),
          term_uuid: Joi.string(),
          first_name: Joi.string().required(),
          last_name: Joi.string().required(),
          email: Joi.string().required(),
          address_ip: Joi.string().required(),
          amount: Joi.number().required(),
          fees: Joi.number().required(),
          currency: Joi.string().required(),
          card_number: Joi.string().required(),
          expiry_date: Joi.string().required(),
          cvc2: Joi.string().required(),
          transaction_status: Joi.string().required(),
          auto_clear: Joi.boolean().required(),
          redirect_url: Joi.string().required(),
          crypto_transfer: Joi.boolean().optional(),
          kyc_delayed: Joi.boolean().optional(),
          wallet: Joi.string().optional(),
      });

      const { error } = schema.validate({
          adax_uuid,
          customer_details_id,
          request_uuid,
          term_uuid,
          first_name,
          last_name,
          email,
          address_ip,
          amount,
          fees,
          currency,
          card_number,
          expiry_date,
          cvc2,
          transaction_status,
          auto_clear,
          redirect_url,
          crypto_transfer,
          kyc_delayed,
          wallet,
      }, { abortEarly: false });

      if (error) {
          const errorMsg =  error.details.map((e: any) => {
              return {
                  key : e.context.key,
                  msg: e.message
              };
          }).reduce((acc: any, curr: any) => {
              acc[curr.key] = curr.msg;
              return acc;
          }, {});
          throw({ code: 422, message: 'Data validation error', error_messages: errorMsg });
      }
      return this.transactionRepository.add(
        adax_uuid,
        customer_details_id,
        request_uuid,
        term_uuid,
        first_name,
        last_name,
        email,
        address_ip,
        amount,
        fees,
        currency,
        card_number,
        expiry_date,
        cvc2,
        transaction_status,
        auto_clear,
        redirect_url,
        crypto_transfer,
        kyc_delayed,
        wallet,
    );
  }

  async createCOFROFTransaction(
    adax_uuid: string,
    customer_details_id: number,
    request_uuid: string,
    term_uuid: string,
    first_name: string,
    last_name: string,
    email: string,
    address_ip: string,
    amount: number,
    fees: number,
    currency: string,
    card_number: string,
    expiry_date: string,
    cvc2: string,
    auto_clear: boolean,
    redirect_url: string,
    is_cof: boolean,
    crypto_transfer: boolean,
    kyc_delayed: boolean,
    wallet?: string,
  ): Promise<any> {
      return this.transactionRepository.addCOFROFTransaction(
        adax_uuid,
        customer_details_id,
        request_uuid,
        term_uuid,
        first_name,
        last_name,
        email,
        address_ip,
        amount,
        fees,
        currency,
        card_number,
        expiry_date,
        cvc2,
        auto_clear,
        redirect_url,
        is_cof,
        crypto_transfer,
        kyc_delayed,
        wallet,
    );
  }

  async addSubsequentCOFROFPayment(
    adax_uuid: string,
    customer_details_id: number,
    request_uuid: string,
    term_uuid: string,
    first_name: string,
    last_name: string,
    email: string,
    address_ip: string,
    amount: number,
    fees: number,
    currency: string,
    auto_clear: boolean,
    initial_uuid: string,
    is_cof: boolean,
    crypto_transfer: boolean,
    kyc_delayed: boolean,
    wallet?: string,
  ): Promise<any> {
      return this.transactionRepository.addSubsequentCOFOrRecurringPayment(
        adax_uuid,
        customer_details_id,
        request_uuid,
        term_uuid,
        first_name,
        last_name,
        email,
        address_ip,
        amount,
        fees,
        currency,
        auto_clear,
        initial_uuid,
        is_cof,
        crypto_transfer,
        kyc_delayed,
        wallet,
    );
  }

  async getTransactionRedirectURL (request_uuid: string): Promise<string> {
    const TransactionData: Transaction | null = await this.transactionRepository.TransactionByRequestUUID(request_uuid)
    console.log(TransactionData, 'TransactionData')
    if (!TransactionData) {
      console.log('UNABLE TO GET THE TRANSACTION');
      return '';
    }

    if (TransactionData?.transaction_redirect_url) {
      console.log(TransactionData?.transaction_redirect_url.redirect_url, 'REDIRECT URL')
      return TransactionData?.transaction_redirect_url.redirect_url;
    } else if (TransactionData?.customer_details) {
      console.log(TransactionData?.customer_details.term_url, 'REDIRECT URL')
      return TransactionData?.customer_details.term_url;
    }
    console.log('NO REDIRECT URL');
    return '';
  }

  async checkCardEnrolledStatus (card: string): Promise<string> {
    try {
      const enrolledStatus = await fenigePaymentClient3dsVerify<string>(card);
      console.log('fenigePaymentClient3dsVerify_RESPONSE', enrolledStatus);
      const updateUnenrolledCard = await UnenrolledCard.findOne({ where: { card } });
      if (updateUnenrolledCard) {
        updateUnenrolledCard.enrolled_status = enrolledStatus;
        await updateUnenrolledCard.save();
      } else {
        const newUnenrolledCard = new UnenrolledCard();
        newUnenrolledCard.card = card;
        newUnenrolledCard.enrolled_status = enrolledStatus;
        await newUnenrolledCard.save();
        console.log(newUnenrolledCard, 'newUnenrolledCardnewUnenrolledCard');
      }

      return enrolledStatus;
    } catch (error) {
      console.log('checkCardEnrolledStatus_ERROR', error);
      throw({...error})
    }
  }

  async getUnenrolledCardStatus(card: string, companyUUID: string): Promise<{ status: string, message: string }> {
    try {
      const data = await UnenrolledCard.findOne({ where: { card } });
      if (!data) {
        return ({ status: '', message: 'Unable to find data' });
      }
      data.companyUUID = companyUUID;
      await data.save();

      if (data.enrolled_status === 'Y') {
        return {
          status: data.enrolled_status,
          message: '',
        };
      }

      if (data.enrolled_status === 'N' || data.enrolled_status === 'U') {
        return {
          status: data.enrolled_status,
          message: 'Card is not present on 3DS verificaton status list, please 3DS verify card',
        };
      }

      if (data.enrolled_status === 'B') {
        return {
          status: data.enrolled_status,
          message: 'Users Card Has Been Blocked for Multiple Unsuccessful Attempts, Please Contact finance@fxramp.com',
        };
      }
      return {
        status: data.enrolled_status,
        message: 'Card is not present on 3DS verificaton status list, please 3DS verify card',
      };
    } catch (error) {
      console.log('isUnenrolledCard_ERROR', error);
      throw({ code: 422, message: 'Unable to process data' });
    }
  }


  async finalizeTransaction (pares: string, md: string): Promise<string> {
    try {
      const finalizeTransactionRes = await fenigePaymentFinalize(pares, md);
      return finalizeTransactionRes;
    } catch (error) {
      console.log('finalizeTransaction_ERROR', error);
      throw({...error})
    }
  }

  async TransactionByIntialUUID( initial_uuid: string ): Promise<Transaction | null> {
    return this.transactionRepository.TransactionByIntialUUID(initial_uuid);
  }

  async transactionByRequestUUID( requestUuid: string ): Promise<Transaction | null> {
    return this.transactionRepository.TransactionByRequestUUID(requestUuid);
  }

  async transactionByRequestUUIDs( requestUuids: string[] ): Promise<Transaction[]> {
    return this.transactionRepository.TransactionByRequestUUIDs(requestUuids);
  }

  async getCOFROCTransactionsByUUIDs( requestUuids: string[] ): Promise<COFRecurringTransaction[]> {
    return this.transactionRepository.getCOFROCTransactionsByUUIDs(requestUuids);
  }

  async getCOFROCTransactionsByUUID( requestUuid: string ): Promise<COFRecurringTransaction| null> {
    return this.transactionRepository.getCOFROCTransactionsByUUID(requestUuid);
  }
  

  async paymentRefund(adaxUuid: string, requestUuid: string, amountToRefund: number): Promise<{ request_uuid: string, message: string, status: string }> {
    try {
      const paymentIsExisting = await this.transactionRepository.getPaymentRefundByRequestUUID(requestUuid);
      const { refundStatus, message, httpStatusCode, responseCode  }: {message: string, refundStatus: string, responseCode: string, httpStatusCode: number} = await fenigePaymentRefund(requestUuid, amountToRefund);

      console.log('REFUND_RESPONSE', refundStatus);
      if (paymentIsExisting) {
        paymentIsExisting.refund_status = refundStatus;
        await paymentIsExisting.save();
      } else {
        const newPaymentRefund = new PaymentRefund();
        newPaymentRefund.request_uuid = requestUuid;
        newPaymentRefund.adax_uuid = adaxUuid;
        newPaymentRefund.amount = amountToRefund; //refundStatus === 'APPROVED' ? -1 * amountToRefund : amountToRefund;
        newPaymentRefund.refund_status = refundStatus;
        newPaymentRefund.response_code = responseCode;
        await newPaymentRefund.save();
      }
      if (httpStatusCode !== 200) {
        throw({ refundStatus, message });
      }
      return { request_uuid: requestUuid, message, status: refundStatus }
    } catch (error) {
      console.log('REFUND_ERROR_RESPONSE', error);
      return { request_uuid: requestUuid, message: error.message, status: error.refundStatus }
    }
  }

  async saveTransaction(transaction: Transaction): Promise<boolean>{
    return this.transactionRepository.saveTransaction(transaction); 
  }
}

export function getCallEvents(user_id: number, page: number, limit: number, search: string, order_by: string) : Promise<any> {
  return new Promise((resolve, reject) => {
    getCallEventsAwait(user_id, page, limit, search, order_by).then((result) => {
          // console.log('get result from getCallEventsAwait :=>',result)
          resolve(result);
      }).catch((err) => {
          console.log('getCallEventsAwait error: ', err);
          reject(err);
      });
  });
}

var getCallEventsAwait = async (user_id: number, page: number, limit: number, search: string, order_by: string) => {
    try {
        // console.log("user_id: page: number, limit: number, order_by ::==>",user_id, page, limit, search, order_by);
        let message = "";
        let status = false;
        let orderByColumn = "";
        let orderBy = "";
        let pageNumber : number = ( typeof page !== 'undefined') ? +page : config.Page;
        let records : number = ( typeof limit !== 'undefined') ? +limit : config.Limit;
        // console.log("typeof search =>",typeof search);
        console.log("typeof order_by =>",typeof order_by);
        let sqlWhereTransaction : string = " WHERE cd.user_id = "+ user_id +" AND t.event_result <> '' ";
        let sqlWhereTransactionStatus : string = " WHERE cd.user_id = "+ user_id +" AND ts.event_result <> '' AND ts.transaction_date <> '0000-00-00 00:00:00' ";
        let orderByArr = (order_by !== '') ? order_by.split("|") : [];
        console.log("ORDERBY orderByArr :", orderByArr);
        let ORDERBY = "";

        if(orderByArr.length === 2){
          orderByColumn = orderByArr[0];
          orderBy = orderByArr[1];
          if(orderByColumn == 'date'){
              orderByColumn = 'createdAt';
          }
          if(orderByColumn == 'time'){
              orderByColumn = 'createdAt';
          }
          if(orderByColumn == 'call'){
              orderByColumn = 'Payment';
          }
          // if(orderByColumn == 'end_point'){
          //     orderByColumn = "'details/query'";
          // }
          ORDERBY = " ORDER BY "+ orderByColumn + " " + orderBy;
        }

        if(typeof search !== 'undefined'){
          sqlWhereTransaction +=" && ( 'Payment' LIKE '%" + search + "%' OR event_result LIKE '%" + search + "%' OR 'payment/auth' LIKE '%" + search + "%' OR request_uuid LIKE '%" + search + "%' ) ";
            sqlWhereTransactionStatus += " && ( 'Get Payment Status' LIKE '%" + search + "%' OR ts.event_result LIKE '%" + search + "%' OR 'details/query' LIKE '%" + search + "%' OR t.request_uuid LIKE '%" + search + "%') ";
        }

        // console.log("sqlWhereTransaction =>",sqlWhereTransaction);
        // console.log("sqlWhereTransactionStatus =>",sqlWhereTransactionStatus);

        const eventLogs = await sequelize.query("SELECT cd.id as cdid, cd.user_id, t.createdAt, 'Payment' as 'call', 'payment/auth' as end_point, t.request_uuid, t.event_result "+
        "from transaction AS t LEFT JOIN customer_details as cd ON (cd.id = t.customer_details_id) " + sqlWhereTransaction +
        "UNION " +
        "SELECT cd.id as cdid, cd.user_id, ts.createdAt, 'Get Payment Status' as 'call', 'details/query' as end_point, t.request_uuid, ts.event_result "+
        "from transaction_status as ts LEFT JOIN transaction as t ON (t.id = ts.transaction_id) LEFT JOIN customer_details as cd "+
        "ON (cd.id = t.customer_details_id)" + sqlWhereTransactionStatus + ORDERBY + " LIMIT " + ((pageNumber-1)*records) + ", " + records , { type: QueryTypes.SELECT });
        
        // query to count number of records falls under given condition...

        const eventLogsCount = await sequelize.query("SELECT cd.id as cdid, cd.user_id, t.createdAt, 'Payment' as 'call', 'payment/auth' as end_point, t.request_uuid, t.event_result "+
        "from transaction AS t LEFT JOIN customer_details as cd ON (cd.id = t.customer_details_id) " + sqlWhereTransaction +
        "UNION " +
        "SELECT cd.id as cdid, cd.user_id, ts.createdAt, 'Get Payment Status' as 'call', 'details/query' as end_point, t.request_uuid, ts.event_result "+
        "from transaction_status as ts LEFT JOIN transaction as t ON (t.id = ts.transaction_id) LEFT JOIN customer_details as cd "+
        "ON (cd.id = t.customer_details_id) " + sqlWhereTransactionStatus , { type: QueryTypes.SELECT });
       
        // console.log('eventLogs =========>',eventLogs);
        // console.log('eventLogsCount.length =========>',eventLogsCount.length);
  
        let callLogs : any = [];
        if(eventLogs.length > 0){
            console.log('eventLogs found!!');
            status = true;
            message = "Call events list fetched successfully!!";
            eventLogs.forEach((element: any,index: number) => {
                let row = {
                    'id': index+1,
                    'date': element.createdAt,
                    // 'time': moment(element.createdAt).subtract({hours: 5, minutes: 30, seconds: 0}).format('HH:mm:ss'),
                    'time': moment(element.createdAt).format('HH:mm:ss'),
                    // 'time': dateFormat(new Date(element.createdAt), "HH:MM:ss"),
                    'request_uuid': element.request_uuid,
                    'call': element.call,
                    'end_point': element.end_point,
                    // 'end_point': element['payment/auth'],
                    'event_result': element.event_result,
                };
                callLogs.push(row);
            });
        }else{
            console.log('Call events not found!!');
            status = false;
            message = "No data found!!";
        }
  
        return ({ status: status, message: message, total_records: eventLogsCount.length, data: callLogs });
    } catch (e) {
        console.log('get call events error: ', e);
        return ({ "status": false, "message": "Something went wrong!!, please try again." });
    }
  };

