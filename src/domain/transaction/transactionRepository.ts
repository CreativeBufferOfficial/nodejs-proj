import moment from 'moment';

import Transaction from '../../data/database/models/Transaction';
import COFRecurringTransaction from '../../data/database/models/COFRecurringTransaction';
import {
  PaymentRefund,
  UnenrolledCard,
  User,
  VolumeFailedTransactionLogs,
  CardFailedTransactionLogs,
  CardFailedTransactionLogsCounter,
  RCDollarVolumeLog,
  RiskControlGlobalConfig,
} from '../../data/database';
import CustomerDetails from '../../data/database/models/CustomerDetails';
import TransactionRedirectURL from '../../data/database/models/TransactionRedirectUrl';
import { config } from '../../configuration';
import { fenigeAddTransaction, fenigeAddCOFOrRecTransaction, fenigeAddCOFOrRecurringSubsequentTransaction, } from '../../domain/fenige/thirdParty';
import Joi from '@hapi/joi';
import { insertTransactionHistory } from '../../domain/transaction_status/transactionStatus';
import { IVolumeFailedTransactionLogsDataDomain, IVolumeFailedTransactionLogsRequest } from './Transaction.domain';

import { volumeByDollorAmount, emailDeclinedPercentage24HrTransactions } from './../../functions';

import { CreateParams } from './ITransactionRepository';

import { Sequelize } from 'sequelize';
// tslint:disable-next-line: no-duplicate-imports
import { Op } from 'sequelize';
export class TransactionRepository {
    // constructor({  }) {

    // }
    async add(
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
        crypto_transfer?: boolean,
        kyc_delayed?: boolean,
        wallet?: string,
    ): Promise<Transaction> {

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

        const newTransaction = new Transaction({
            adax_uuid,
            customer_details_id,
            request_uuid,
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
            crypto_transfer,
            kyc_delayed,
            wallet,
            merchant_uuid: config.MerchantUuid,
            created_date: new Date(),
            updated_date: new Date(),
        });

        const checkExist : any = await this.checkExistReqestUuid(request_uuid);


        if(checkExist === 0){

            const fenigeRes: any = await fenigeAddTransaction(
                request_uuid,
                term_uuid,
                first_name,
                last_name,
                email,
                address_ip,
                amount,
                currency,
                card_number,
                expiry_date,
                cvc2,
                auto_clear);


            if(fenigeRes.statusCode !== 400){

            const newTransactionSaved = await newTransaction.save();

            
            const newTransactionRedirectURL = new TransactionRedirectURL({
              redirect_url,
              transaction_id: newTransactionSaved.id,
            });
            await newTransactionRedirectURL.save();

            const updatetransactionresult : any = await this.updateTransactionStatus(request_uuid,  fenigeRes.body.transactionStatus ? fenigeRes.body.transactionStatus : '', fenigeRes.body.responseCode, fenigeRes.body.message);
            const riskControlGlobalConfig = await RiskControlGlobalConfig.findOne();
            if (riskControlGlobalConfig && riskControlGlobalConfig.enabled) {
              await this.checkCardTransactions24Hr(fenigeRes.body.transactionStatus, fenigeRes.body.responseCode, card_number, adax_uuid, request_uuid, email);
              await this.checkDeclinedTransactions(fenigeRes.body.transactionStatus, adax_uuid);
            }

            // console.log('updatetransactionresult ====>',updatetransactionresult);

                if(updatetransactionresult > 0){

                    // if (fenigeRes.body.status == 'S0000') {

                        // console.log('#if get into fenigeRes.body.status S0000#');

                        var insertRes = await insertTransactionHistory(newTransactionSaved.id, fenigeRes.body.clearingAmount, fenigeRes.body.createdDate, fenigeRes.body.transactionStatus, fenigeRes.body['3DS'], fenigeRes.body.message);

                        insertRes = JSON.parse(JSON.stringify(insertRes));

                        console.log('insertTransactionHistory resp :', insertRes);

                        // resolve({ "status": true, "message": fenigeRes.body.message });
                    // }
                    // else {
                    //     console.log('#else get into fenigeRes.body.status S0000#');
                    //     var transactionDate = new Date('0000/00/00');
                    //     var insertRes = await insertTransactionHistory(newTransactionSaved.id, '0.00', transactionDate, '', false, fenigeRes.body.message);

                    //     insertRes = JSON.parse(JSON.stringify(insertRes));

                    //     console.log('insertTransactionHistory resp in else :', insertRes);

                    //     // reject({ "status": false, "message": fenigeRes.body.message ? fenigeRes.body.message : "Something went wrong!!, please try again." });
                    // }
                }else{
                    console.log('#get into this else#');
                    // reject({ "status": false, "message": "Something went wrong!!, please try again." });
                }

            }else{
                console.log("got fenigeRes.statusCode 400 BAD REQUEST ");
            }

            return fenigeRes.body;

        }else{
            const res : any = {
                status: false,
                message: 'Request UUID is the same'
            };

            return res;
        }

    }

    async addCOFROFTransaction(
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
        crypto_transfer?: boolean,
        kyc_delayed?: boolean,
        wallet?: string,
    ): Promise<Transaction> {

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
            auto_clear: Joi.boolean().required(),
            redirect_url: Joi.string().required(),
            is_cof: Joi.boolean().required(),
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
            auto_clear,
            redirect_url,
            is_cof,
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

        const newTransaction = new Transaction({
            adax_uuid,
            customer_details_id,
            request_uuid,
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
            crypto_transfer,
            kyc_delayed,
            wallet,
            merchant_uuid: config.MerchantUuid,
            created_date: new Date(),
            updated_date: new Date(),
        });

        const checkExist : any = await this.checkExistReqestUuid(request_uuid);

        console.log("result of checkExist ===>",checkExist);

        if(checkExist === 0){

            const fenigeRes: any = await fenigeAddCOFOrRecTransaction(
                request_uuid,
                term_uuid,
                first_name,
                last_name,
                email,
                address_ip,
                amount,
                currency,
                card_number,
                expiry_date,
                cvc2,
                auto_clear,
                is_cof);

            console.log('fenige response ==>',fenigeRes);
            if(fenigeRes.statusCode === 200){

            newTransaction.cof_rof_initial_uuid = is_cof ? fenigeRes.body.cofInitialUuid : fenigeRes.body.recurringInitialUuid;
            newTransaction.transaction_status = fenigeRes.body.transactionStatus
            const newTransactionSaved = await newTransaction.save();

            console.log('newTransaction =======>',newTransactionSaved);
            
            console.log('CREATING NEW TRANSACTION REDIRECT URL')
            const newTransactionRedirectURL = new TransactionRedirectURL({ transaction_id: newTransactionSaved.id, redirect_url });
            await newTransactionRedirectURL.save();
            console.log('NEW REDIRECT URL', newTransactionRedirectURL)

            const updatetransactionresult : any = await this.updateTransactionStatus(request_uuid,  fenigeRes.body.transactionStatus ? fenigeRes.body.transactionStatus : '', fenigeRes.body.responseCode, fenigeRes.body.message);

            const riskControlGlobalConfig = await RiskControlGlobalConfig.findOne();
            if (riskControlGlobalConfig && riskControlGlobalConfig.enabled) {
              await this.checkCardTransactions24Hr(fenigeRes.body.transactionStatus, fenigeRes.body.responseCode, card_number, adax_uuid, request_uuid, email);
              await this.checkDeclinedTransactions(fenigeRes.body.transactionStatus, adax_uuid);
            }
            // console.log('updatetransactionresult ====>',updatetransactionresult);

                if(updatetransactionresult > 0){

                    // if (fenigeRes.body.status == 'S0000') {

                        // console.log('#if get into fenigeRes.body.status S0000#');

                        var insertRes = await insertTransactionHistory(newTransactionSaved.id, fenigeRes.body.clearingAmount, fenigeRes.body.createdDate, fenigeRes.body.transactionStatus, fenigeRes.body['3DS'], fenigeRes.body.message);

                        insertRes = JSON.parse(JSON.stringify(insertRes));

                        console.log('insertTransactionHistory resp :', insertRes);

                        // resolve({ "status": true, "message": fenigeRes.body.message });
                    // }
                    // else {
                    //     console.log('#else get into fenigeRes.body.status S0000#');
                    //     var transactionDate = new Date('0000/00/00');
                    //     var insertRes = await insertTransactionHistory(newTransactionSaved.id, '0.00', transactionDate, '', false, fenigeRes.body.message);

                    //     insertRes = JSON.parse(JSON.stringify(insertRes));

                    //     console.log('insertTransactionHistory resp in else :', insertRes);

                    //     // reject({ "status": false, "message": fenigeRes.body.message ? fenigeRes.body.message : "Something went wrong!!, please try again." });
                    // }
                }else{
                    console.log('#get into this else#');
                    // reject({ "status": false, "message": "Something went wrong!!, please try again." });
                }

            }else{
                console.log("got fenigeRes.statusCode 400 BAD REQUEST ");
            }

            return fenigeRes.body;

        }else{
            const res : any = {
                status: false,
                message: 'Request UUID is the same'
            };

            return res;
        }
    } 

    async addSubsequentCOFOrRecurringPayment(
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
        crypto_transfer?: boolean,
        kyc_delayed?: boolean,
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
            auto_clear: Joi.boolean().required(),
            initial_uuid: Joi.string().required(),
            is_cof: Joi.boolean().required(),
            crypto_transfer: Joi.boolean(),
            kyc_delayed: Joi.boolean(),
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
            auto_clear,
            initial_uuid,
            is_cof,
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
            console.log(errorMsg, 'errorMsg');
            throw({ code: 422, message: 'Data validation error', error_messages: errorMsg });
        }
        const checkExist : any = await this.checkExistCOFROFReqestUuid(request_uuid);
        console.log("result of checkExist ===>",checkExist);
        if(!checkExist){
            const newCOFRecurringTransaction = new COFRecurringTransaction({
                adax_uuid,
                customer_details_id,
                request_uuid,
                merchant_uuid: config.MerchantUuid,
                first_name,
                last_name,
                email,
                address_ip,
                amount,
                fees,
                currency,
                auto_clear,
                created_date: new Date(),
                updated_date: new Date(),
            });
            const fenigeRes: any = await fenigeAddCOFOrRecurringSubsequentTransaction(request_uuid, initial_uuid, amount, currency, auto_clear, is_cof);

            console.log('fenige response ==>',fenigeRes);
            if(fenigeRes.statusCode === 200){
                newCOFRecurringTransaction.initial_uuid = is_cof ? fenigeRes.body.cofInitialUuid : fenigeRes.body.recurringInitialUuid;
                newCOFRecurringTransaction.transaction_status = fenigeRes.body.transactionStatus;
                newCOFRecurringTransaction.transaction_type = is_cof ? 'COF' : 'ROC';
                await newCOFRecurringTransaction.save();
                return newCOFRecurringTransaction;
            }
            return fenigeRes.body;
        } else {
            const res : any = {
                status: false,
                message: 'Request UUID is the same'
            };
            return res;
        }
    }

    async updateTransactionStatus(
        request_uuid: string,
        transaction_status: string,
        response_code: string,
        event_result: string) {
        return new Promise((resolve, reject) => {
          console.log(response_code, 'response_coderesponse_code');
            const date_updated = new Date();
            Transaction
                .update({
                    transaction_status,
                    response_code,
                    event_result, 
                    date_updated
                }, {where: {request_uuid}})
                .then((result) => {
                    // console.log('updateData resolved: ', result);
                    resolve(result);
                })
                .catch((err) => {
                    console.log('updateData error: ', err);
                    reject({ "status": false, "message": "Something went wrong!!, please try again." });
                });
        });
    }

    async checkExistReqestUuid( request_uuid: string ) {
        // console.log("called checkExistReqestUuid");

        return new Promise((resolve, reject) => {
            Transaction.findAndCountAll({where: {request_uuid}})
                .then((result) => {
                    // console.log("Exist result count =>>",result.count);
                    resolve(result.count);
                })
                .catch((err : any) => {
                    console.log('checkExistReqestUuid error: ', err);
                    reject({ "message": "Something went wrong!!, please try again." });
                });
        });
    }

    async checkExistCOFROFReqestUuid( request_uuid: string ) {
        await COFRecurringTransaction.findAll({ where: { request_uuid } });
    }
    async getCOFROCTransactionsByUUIDs( request_uuids: string[] ): Promise<COFRecurringTransaction[]> {
        return await COFRecurringTransaction.findAll({ where: { request_uuid: request_uuids } });
    }

    async getCOFROCTransactionsByUUID( request_uuid: string ): Promise<COFRecurringTransaction | null> {
        return await COFRecurringTransaction.findOne({ where: { request_uuid } });
    }
    
    async TransactionByRequestUUID( request_uuid: string ): Promise<Transaction | null> {
        const TransactionData: Transaction | null = await Transaction.findOne({ where: { request_uuid }, include: [TransactionRedirectURL, ] });
        return TransactionData
    }
    
    async transactionByRequestUUID( request_uuid: string ): Promise<Transaction | null> {
      const TransactionData: Transaction | null = await Transaction.findOne({ where: { request_uuid }, include: [TransactionRedirectURL, CustomerDetails] });
      return TransactionData
  }

    async TransactionByRequestUUIDs( request_uuids: string[] ): Promise<Transaction[] | []> {
        const TransactionData: Transaction[] | [] = await Transaction.findAll({ where: { request_uuid: request_uuids } });
        return TransactionData
    }

    async TransactionByIntialUUID( initial_uuid: string ): Promise<Transaction | null> {
        console.log(initial_uuid, 'initial_uuidinitial_uuid');
        const TransactionData: Transaction | null = await Transaction.findOne({ where: { cof_rof_initial_uuid: initial_uuid } });
        return TransactionData
    }

    async getPaymentRefundByRequestUUID (request_uuid: string): Promise<PaymentRefund | null>{
        const paymentRefund: PaymentRefund | null = await PaymentRefund.findOne({ where: { request_uuid } });
        return paymentRefund;
    }

    /**
     * volumeByDollarAmountChecker
     * 
     * @description
     * 
     * This function will check all approved rolling 24 hour transactions 
     * of a given customer and will trigger an email alarm if it breached
     * 250k USD volume
     */
    async volumeByDollarAmountChecker () {
      const last24HrRCDollarVolumeLogs =  await RCDollarVolumeLog.findOne({
        where: Sequelize.literal(
          `created_at
              BETWEEN 
          DATE_SUB(NOW(), INTERVAL 24 HOUR) AND NOW()`),
        order: [
          ['created_at', 'DESC']
        ],
      });
      let fromCondition = `DATE_SUB(NOW(), INTERVAL 24 HOUR)`;
      if (last24HrRCDollarVolumeLogs) {
        fromCondition = `DATE_FORMAT("${moment(last24HrRCDollarVolumeLogs.createdAt).format('YYYY-MM-DD hh:mm:ss')}", "%Y-%m-%d %h:%i:%s")`;
      }
      const last24HrTransactionsTotalAmount: any = await Transaction.findOne({
        attributes: [
          [Sequelize.literal('sum(amount/100)'), 'totalApproved24HrTransactionsAmount'],
        ],
          where: Sequelize.literal(
              `createdAt
                  BETWEEN 
              ${fromCondition} AND NOW()
              AND transaction_status IN ('APPROVED', 'CLEARED')`
          ),
        });
      if (
        last24HrTransactionsTotalAmount.dataValues && 
        last24HrTransactionsTotalAmount.dataValues.totalApproved24HrTransactionsAmount >= 250000
      ) {
        await RCDollarVolumeLog.create({ volume: last24HrTransactionsTotalAmount.dataValues.totalApproved24HrTransactionsAmount });
        const last24HrTransactions = await Transaction.findAll({
          attributes: [
            'id',
            'adax_uuid',
            'customer_details_id',
            'request_uuid',
            'merchant_uuid',
            'first_name',
            'last_name',
            'email',
            'address_ip',
            [Sequelize.literal('amount/100'), 'amount'],
            'currency',
            'card_number',
            'expiry_date',
            'cvc2',
            'transaction_status',
            'response_code',
            'event_result',
            'auto_clear',
            'cof_rof_initial_uuid',
            'fees',
            'refund_status',
            'createdAt',
            'updatedAt',
          ],
          where: Sequelize.literal(
                `createdAt
                    BETWEEN 
                ${fromCondition} AND NOW()
                AND transaction_status IN ('APPROVED', 'CLEARED')`
            ),
          });

        const templateData = {};
        await volumeByDollorAmount(last24HrTransactions, templateData);
      }
    }

    /**
     * check24HrVolume
     * @param {String} transactionStatus String value
     * @param {Number} customerDetailsId Number value
     * 
     * @description
     * 
     * This function will check all approved rolling 24 hour transactions 
     * of a given customer and will trigger an email alarm if it breached
     * 250k USD volume
     */
    async check24HrVolume (transactionStatus: string, adaxUUID: string) {
      if (!['APPROVED', 'CLEARED'].includes(transactionStatus)) {
        return;
      }
      const last24HrTransactionsTotalAmount: any = await Transaction.findOne({
        attributes: [
          [Sequelize.literal('sum(amount/100)'), 'totalApproved24HrTransactionsAmount'],
          [Sequelize.literal(`(SELECT
            sum(amount)
            from
              transaction
            where
              adax_uuid = '${adaxUUID}'
            AND createdAt BETWEEN DATE_SUB(NOW(), INTERVAL 24 HOUR) AND NOW())`
          ), 'total24HrTransactionsAmount'],
          [Sequelize.literal(`((SELECT
              sum(amount/100)
              from
              transaction
              where
              (transaction_status = 'DECLINED'
              or transaction_status = 'NO_3DS_AUTHENTICATION')
              AND response_code = 'Code_05'
              AND adax_uuid = '${adaxUUID}'
              AND createdAt BETWEEN DATE_SUB(NOW(), INTERVAL 24 HOUR) AND NOW()) / sum(amount/100)) * 100`
              ), 'rc1'],
          [Sequelize.literal(`((SELECT
              sum(amount)
              from
              transaction
              where
              (transaction_status = 'DECLINED'
              or transaction_status = 'NO_3DS_AUTHENTICATION')
              AND response_code = 'Code_61'
              AND adax_uuid = '${adaxUUID}'
              AND createdAt BETWEEN DATE_SUB(NOW(), INTERVAL 24 HOUR) AND NOW()) / sum(amount)) * 100`
              ), 'rc2'],
          [Sequelize.literal(`((SELECT
              sum(amount)
              from
              transaction
              where
              (transaction_status = 'DECLINED'
              or transaction_status = 'NO_3DS_AUTHENTICATION')
              AND response_code = 'Code_51'
              AND adax_uuid = '${adaxUUID}'
              AND createdAt BETWEEN DATE_SUB(NOW(), INTERVAL 24 HOUR) AND NOW()) / sum(amount)) * 100`
              ), 'rc3'],
          [Sequelize.literal(`((SELECT
              sum(amount)
              from
              transaction
              where
              (transaction_status = 'DECLINED'
              or transaction_status = 'NO_3DS_AUTHENTICATION')
              AND response_code = 'Code_63'
              AND adax_uuid = '${adaxUUID}'
              AND createdAt BETWEEN DATE_SUB(NOW(), INTERVAL 24 HOUR) AND NOW()) / sum(amount)) * 100`
              ), 'rc4'],
        ],
          where: Sequelize.literal(
              `createdAt
                  BETWEEN 
              DATE_SUB(NOW(), INTERVAL 24 HOUR) AND NOW()
              AND transaction_status IN ('APPROVED', 'CLEARED')`
          ),
        });
      console.log('LAST24HR_TRANSACTIONS_TOTAL_AMOUNT', last24HrTransactionsTotalAmount.dataValues);
      if (
        last24HrTransactionsTotalAmount.dataValues && 
        last24HrTransactionsTotalAmount.dataValues.totalApproved24HrTransactionsAmount >= 250000
      ) {
        const last24HrTransactions = await Transaction.findAll({
          where: Sequelize.literal(
                `createdAt
                    BETWEEN 
                DATE_SUB(NOW(), INTERVAL 24 HOUR) AND NOW()
                AND transaction_status IN ('APPROVED', 'CLEARED')`
            ),
          });
        console.log('FENIGE_TRANSACTION_APPROVED', transactionStatus);
        console.log('ALL_24_HOUR_TRANSACTIONS_FOR_CARD', last24HrTransactions);
        const customerDetails = await CustomerDetails.findOne({ where: { company_uuid: adaxUUID } });
        if (customerDetails) {
          await this.createAlarmLog(
            customerDetails?.id,
            last24HrTransactionsTotalAmount.dataValues.total24HrTransactionsAmount,
            last24HrTransactionsTotalAmount.dataValues.rc1,
            last24HrTransactionsTotalAmount.dataValues.rc2,
            last24HrTransactionsTotalAmount.dataValues.rc3,
            last24HrTransactionsTotalAmount.dataValues.rc4,
          'Volume By Dollar Amount Exceeded');
        }
        
        const templateData = {
          companyName: customerDetails?.company_name,
        };
        console.log(templateData, 'templateDatatemplateData');
        console.log(!volumeByDollorAmount, 'volumeByDollorAmountvolumeByDollorAmount');
        // await volumeByDollorAmount(last24HrTransactions, templateData);
      }
    }

    /**
     * checkCardTransactions24Hr
     * @param {String} transactionStatus String value
     * @param {String} responseCode String value
     * 
     * @param {Number} customerDetailsId Number value
     * 
     * @description
     * 
     * This function will check all failed transactions within rolling 24 hour
     * of a given card and will block if card has 3 failed attempts
     */
    async checkCardTransactions24Hr (
      transactionStatus: string,
      responseCode: string,
      card_number: string, 
      companyUUID: string,
      request_uuid: string,
      user_email: string,
    ) {
      try {
          
        if (
          transactionStatus === 'WAITING_ON_3DS_CONFIRMATION' ||
          transactionStatus === 'NO_3DS_AUTHENTICATION' ||
          transactionStatus === 'DECLINED' ||
          transactionStatus === 'REJECTED'
        ) {

          const statuses = {
            WAITING_ON_3DS_CONFIRMATION: 'Waiting on 3DS confirmation',
            NO_3DS_AUTHENTICATION: 'No 3DS Authentication',
            DECLINED: 'Declined',
            REJECTED: 'Rejected',
          };

          const enrolledCard = await UnenrolledCard.findOne({ where: { card: card_number } });
          if (enrolledCard && enrolledCard.enrolled_status === 'B') {
            return;
          }
          if (['Code_41', 'Code_43'].includes(responseCode)) {
            if (enrolledCard) {
              enrolledCard.enrolled_status = 'B';
              enrolledCard.companyUUID = companyUUID;
              enrolledCard.save();
              await CardFailedTransactionLogs.create({
                card_number,
                user_email,
                request_uuid,
                attempts: 3,
                status: 1,
                latest_alert_sent: statuses[transactionStatus] || 'Declined',
                unenrolled_card_id: enrolledCard.id,
              });
            }
          }

          const data = await this.checkAndGenerateCardFailedCounter({card_number, company_uuid: companyUUID,transaction_status: transactionStatus });
          if (!data) return;
          if (
              data.waiting_verify_attempts >= 3 ||
              data.no_auth_attempts >= 3 ||
              data.declined_attempts >= 3) {
            if (enrolledCard) {
              enrolledCard.enrolled_status = 'B';
              enrolledCard.companyUUID = companyUUID;
              enrolledCard.save();
              await CardFailedTransactionLogs.create({
                card_number,
                user_email,
                request_uuid,
                attempts: 3,
                status: 1,
                latest_alert_sent: statuses[transactionStatus] || 'Declined',
                unenrolled_card_id: enrolledCard?.id,
              });
            }
          }
        }
      } catch (_error) {
        console.log('checkCardTransactions24Hr_ERROR', _error)
      }
  }

  /**
   * checkDeclinedTransactions
   * @param {String} transactionStatus String value
   * @param {Number} customerDetailsId Number value
   * 
   * @description
   * 
   * This function will check all declined transactions within rolling 24hr period
   * and will 
   */
  async checkDeclinedTransactions (transactionStatus: string, adaxUUID: string) {
    try {
      const customerDetails = await CustomerDetails.findOne({ where: { company_uuid: adaxUUID } });

      if (customerDetails) {
      const VolumeFailedTransactionLogsLatest = await VolumeFailedTransactionLogs.findOne({
        where: {
          customer_details_id: customerDetails.id
        },
        order: [
          ['createdAt', 'DESC'],
        ],
      });
      let fromCondition = 'DATE_SUB(NOW(), INTERVAL 24 HOUR)';
      if (VolumeFailedTransactionLogsLatest) {
        fromCondition = `DATE_FORMAT("${moment(VolumeFailedTransactionLogsLatest.createdAt).format('YYYY-MM-DD hh:mm:ss')}", "%Y-%m-%d %h:%i:%s")`;
      }
      if (['NO_3DS_AUTHENTICATION', 'DECLINED'].includes(transactionStatus)) {
        const last24HrTransactionsDeclinedPercentage: any = await Transaction.findOne({
          attributes: [
              [Sequelize.literal('sum(amount/100)'), 'totalTransactionsAmount'],
              [Sequelize.literal(`((SELECT
                  sum(amount)
                  from
                  transaction
                  where
                  (transaction_status = 'DECLINED'
                  or transaction_status = 'NO_3DS_AUTHENTICATION')
                  AND response_code = 'CODE_05'
                  AND adax_uuid = '${adaxUUID}'
                  AND createdAt BETWEEN ${fromCondition} AND NOW()) / sum(amount)) * 100`
                  ), 'rc1'],
              [Sequelize.literal(`((SELECT
                  sum(amount)
                  from
                  transaction
                  where
                  (transaction_status = 'DECLINED'
                  or transaction_status = 'NO_3DS_AUTHENTICATION')
                  AND response_code = 'CODE_61'
                  AND adax_uuid = '${adaxUUID}'
                  AND createdAt BETWEEN ${fromCondition} AND NOW()) / sum(amount)) * 100`
                  ), 'rc2'],
              [Sequelize.literal(`((SELECT
                  sum(amount)
                  from
                  transaction
                  where
                  (transaction_status = 'DECLINED'
                  or transaction_status = 'NO_3DS_AUTHENTICATION')
                  AND response_code = 'CODE_51'
                  AND adax_uuid = '${adaxUUID}'
                  AND createdAt BETWEEN ${fromCondition} AND NOW()) / sum(amount)) * 100`
                  ), 'rc3'],
              [Sequelize.literal(`((SELECT
                  sum(amount)
                  from
                  transaction
                  where
                  (transaction_status = 'DECLINED'
                  or transaction_status = 'NO_3DS_AUTHENTICATION')
                  AND response_code = 'CODE_63'
                  AND adax_uuid = '${adaxUUID}'
                  AND createdAt BETWEEN ${fromCondition} AND NOW()) / sum(amount)) * 100`
                  ), 'rc4'],
            ],
            where: Sequelize.literal(
                `createdAt
                    BETWEEN 
                ${fromCondition} AND NOW()
                AND adax_uuid = '${adaxUUID}'`
            ),
        });
        console.log('LAST_24HR_TRANSACTIONS_DECLINED_PERCENTAGE', last24HrTransactionsDeclinedPercentage);
        if (last24HrTransactionsDeclinedPercentage.dataValues.rc1 >= 25) {
          const customerEmail = [];
          if (customerDetails) {
            const user = await User.findOne({ where: { id: customerDetails?.user_id } });
            customerEmail.push(user?.email)
          }
          const templateData = {
            declinedPercentage: last24HrTransactionsDeclinedPercentage.dataValues.rc1.toFixed(4),
            companyName: customerDetails?.company_name,
          };
  
          await emailDeclinedPercentage24HrTransactions(customerEmail, templateData);
        }
        
        if (
          last24HrTransactionsDeclinedPercentage.dataValues.rc1 >= 30 ||
          last24HrTransactionsDeclinedPercentage.dataValues.rc2 >= 30 ||
          last24HrTransactionsDeclinedPercentage.dataValues.rc3 >= 30 ||
          last24HrTransactionsDeclinedPercentage.dataValues.rc4 >= 30
          ) {
            await this.createAlarmLog(
              customerDetails.id,
              last24HrTransactionsDeclinedPercentage.dataValues.totalTransactionsAmount,
              last24HrTransactionsDeclinedPercentage.dataValues.rc1,
              last24HrTransactionsDeclinedPercentage.dataValues.rc2,
              last24HrTransactionsDeclinedPercentage.dataValues.rc3,
              last24HrTransactionsDeclinedPercentage.dataValues.rc4,
              transactionStatus === 'DECLINED' ? 'Failed Transaction' : 'No 3DS Authentication');

            if (customerDetails) {
              customerDetails.is_active = 2;
              await customerDetails.save();
            }
          }
        }
      }
    } catch (_error) {
      console.log('checkDeclinedTransactions_ERROR', _error);
    }
  }

  async checkAndGenerateCardFailedCounter (
    { card_number, company_uuid, transaction_status }:
    { card_number: string, company_uuid: string, transaction_status: string }):
    Promise<CardFailedTransactionLogsCounter | null>{
    const unenrolled_card = await this.getCardIdByNumber({ card_number });
    if (!unenrolled_card) return null;
    const selectedCardFailedTransactionLogsCounter = await CardFailedTransactionLogsCounter.findOne({
      where: {
        company_uuid,
        unenrolled_card_id: unenrolled_card.id,
      }
    });

    console.log(selectedCardFailedTransactionLogsCounter, 'selectedCardFailedTransactionLogsCounterselectedCardFailedTransactionLogsCounter');
    if (selectedCardFailedTransactionLogsCounter) {
      if (transaction_status === 'WAITING_ON_3DS_CONFIRMATION') {
        if (moment(selectedCardFailedTransactionLogsCounter.waiting_verify_updated_at).isAfter(moment().subtract('hour', 24))) {
          console.log(JSON.parse(JSON.stringify(selectedCardFailedTransactionLogsCounter)), 'selectedCardFailedTransactionLogsCounterxxx1');
          await selectedCardFailedTransactionLogsCounter.update({
            waiting_verify_attempts: selectedCardFailedTransactionLogsCounter.waiting_verify_attempts + 1,
            declined_updated_at: moment(),
          });
          console.log(JSON.parse(JSON.stringify(selectedCardFailedTransactionLogsCounter)), 'selectedCardFailedTransactionLogsCounterxxx2');
        } else {
          await selectedCardFailedTransactionLogsCounter.update({
            waiting_verify_attempts: 1,
            waiting_verify_updated_at: moment(),
          });
        }
      } else if (transaction_status === 'NO_3DS_AUTHENTICATION') {
        if (moment(selectedCardFailedTransactionLogsCounter.no_auth_updated_at).isAfter(moment().subtract('hour', 24))) {
          await selectedCardFailedTransactionLogsCounter.update({
            no_auth_attempts: selectedCardFailedTransactionLogsCounter.no_auth_attempts + 1,
            no_auth_updated_at: moment(),
          });
        } else {
          await selectedCardFailedTransactionLogsCounter.update({
            no_auth_attempts: 1,
            no_auth_updated_at: moment(),
          });
        }
      } else if (transaction_status === 'DECLINED') {
        if (moment(selectedCardFailedTransactionLogsCounter.declined_updated_at).isAfter(moment().subtract('hour', 24))) {
          await selectedCardFailedTransactionLogsCounter.update({
            declined_attempts: selectedCardFailedTransactionLogsCounter.declined_attempts + 1,
            declined_updated_at: moment(),
          });
        } else {
          await selectedCardFailedTransactionLogsCounter.update({
            declined_attempts: 1,
            declined_updated_at: moment(),
          });
        }
      }
      console.log(JSON.parse(JSON.stringify(selectedCardFailedTransactionLogsCounter)), 'selectedCardFailedTransactionLogsCounterxxx');
      return selectedCardFailedTransactionLogsCounter;
    }

    const newCardFailedTransactionLogsCounter = new CardFailedTransactionLogsCounter();
    newCardFailedTransactionLogsCounter.unenrolled_card_id = unenrolled_card.id;
    newCardFailedTransactionLogsCounter.company_uuid = company_uuid;

    if (transaction_status === 'WAITING_ON_3DS_CONFIRMATION') {
      newCardFailedTransactionLogsCounter.waiting_verify_attempts = 1;
    } else if (transaction_status === 'NO_3DS_AUTHENTICATION') {
      newCardFailedTransactionLogsCounter.no_auth_attempts = 1;
    } else if (transaction_status === 'DECLINED') {
      newCardFailedTransactionLogsCounter.declined_attempts = 1;
    }
    await newCardFailedTransactionLogsCounter.save();
    return newCardFailedTransactionLogsCounter;
  }

  async getCardIdByNumber ({ card_number }: { card_number: string }): Promise<UnenrolledCard | null> {
    try {
      return await UnenrolledCard.findOne({ where: { card: card_number } });
    } catch (error) {
      return null;
    }
  }

  async createAlarmLog (
    customerDetails: number,
    transactionVolume: number,
    rc1: number,
    rc2: number,
    rc3: number,
    rc4: number,
    latestalertSent: string
  ) {
    try {
      let status = 'Green';
      if (latestalertSent !== 'Volume By Dollar Amount Exceeded') {
        status = 'Red';
      }
      await VolumeFailedTransactionLogs.create({
        status,
        rc1,
        rc2,
        rc3,
        rc4,
        customer_details_id: customerDetails,
        transaction_volume: transactionVolume,
        latest_alert_sent: latestalertSent,
      });
    } catch (_error) {
      console.log('ALARM_LOG_CREATE_ERROR', _error)
    }
  }

  async getVolumeFailedTransactionLogs ({
    searchQuery,
    orderByField,
    orderSort,
    page = 1,
    limit = 10,
  }: IVolumeFailedTransactionLogsRequest
  ) : Promise<{pages: number, limit: number, current_page: number, total: number, data: IVolumeFailedTransactionLogsDataDomain[]}>{
    const sortableFieldsObj : any = {
      company_name: '`customer_details.company_name`',
      transaction_volume: '`transaction_volume`',
      rc1: '`rc1`',
      rc2: '`rc2`',
      rc3: '`rc3`',
      rc4: '`rc4`',
      status: '`status`',
      latest_alert_sent: '`latest_alert_sent`',
      updatedAt: '`updatedAt`',
    };
    const sortField = sortableFieldsObj[orderByField] || 'updatedAt';
    const { rows: data, count } = await VolumeFailedTransactionLogs.findAndCountAll({ 
      limit,
      include: [ CustomerDetails ],
      where: {
        [Op.or]: {
          latest_alert_sent: { [Op.like]: `%${searchQuery}%` },
          '$customer_details.company_name$': { [Op.like]: `%${searchQuery}%` },
        }
      },
      order: [
        [ Sequelize.literal(sortField), ['DESC', 'ASC'].includes(orderSort) ? orderSort : 'DESC' ],
      ],
      offset: limit * (page - 1),
      subQuery: false,
    });
    const pages = Math.ceil(count / limit);
    return {
      pages,
      limit,
      current_page: page,
      total: count,
      data: data.length ? data.map((d: VolumeFailedTransactionLogs): IVolumeFailedTransactionLogsDataDomain => {
        return { 
          id: d.id,
          customer: d.customer_details.company_name,
          transaction_volume: d.transaction_volume,
          rc1: d.rc1,
          rc2: d.rc2,
          rc3: d.rc3,
          rc4: d.rc4,
          status: d.status,
          latest_alert_sent: d.latest_alert_sent,
          updated_at: d.updatedAt,
        };
      })
      : []
    };
  }
  
  async saveTransaction(transaction: Transaction): Promise<boolean> {
    try {
      if (transaction.save()) {
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  async create(data: CreateParams): Promise<any> {

    const schema = Joi.object({
        company_uuid: Joi.string().required(),
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
        merchant_uuid: Joi.string().required(),
        crypto_transfer: Joi.boolean().optional(),
        kyc_delayed: Joi.boolean().optional(),
        wallet: Joi.string().optional(),
    });
    const {
      company_uuid,
      customer_details_id,
      request_uuid,
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
      merchant_uuid,
      response_code,
      event_result,
    } = data;
    const { error } = schema.validate({
        company_uuid,
        customer_details_id,
        request_uuid,
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
        merchant_uuid,
    }, { abortEarly: false });

    if (error) {
      console.log(error, 'errorerror');
        const errorMsg =  error.details.map((e: any) => {
            return {
                key : e.context.key,
                msg: e.message
            };
        }).reduce((acc: any, curr: any) => {
            acc[curr.key] = curr.msg;
            return acc;
        }, {});
        throw({ code: 422, message: 'Data validation error', errorMessages: errorMsg });
    }

    const newTransaction = new Transaction({
        adax_uuid: company_uuid,
        customer_details_id,
        request_uuid,
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
        crypto_transfer,
        kyc_delayed,
        wallet,
        merchant_uuid,
        response_code,
        event_result,
        created_date: new Date(),
        updated_date: new Date(),
    });

    const savedData = await newTransaction.save();

    return savedData;


    // if(fenigeRes.statusCode !== 400){

    // const newTransactionSaved = await newTransaction.save();

    
    // const newTransactionRedirectURL = new TransactionRedirectURL({
    //   redirect_url,
    //   transaction_id: newTransactionSaved.id,
    // });
    // await newTransactionRedirectURL.save();

    // // const updatetransactionresult : any = await this.updateTransactionStatus(request_uuid,  fenigeRes.body.transactionStatus ? fenigeRes.body.transactionStatus : '', fenigeRes.body.responseCode, fenigeRes.body.message);
    // // const riskControlGlobalConfig = await RiskControlGlobalConfig.findOne();
    // // if (riskControlGlobalConfig && riskControlGlobalConfig.enabled) {
    // //   await this.checkCardTransactions24Hr(fenigeRes.body.transactionStatus, fenigeRes.body.responseCode, card_number, adax_uuid, request_uuid, email);
    // //   await this.checkDeclinedTransactions(fenigeRes.body.transactionStatus, adax_uuid);
    // // }

    // // console.log('updatetransactionresult ====>',updatetransactionresult);

    //     if(updatetransactionresult > 0){

    //         // if (fenigeRes.body.status == 'S0000') {

    //             // console.log('#if get into fenigeRes.body.status S0000#');

    //             var insertRes = await insertTransactionHistory(newTransactionSaved.id, fenigeRes.body.clearingAmount, fenigeRes.body.createdDate, fenigeRes.body.transactionStatus, fenigeRes.body['3DS'], fenigeRes.body.message);

    //             insertRes = JSON.parse(JSON.stringify(insertRes));

    //             console.log('insertTransactionHistory resp :', insertRes);

    //             // resolve({ "status": true, "message": fenigeRes.body.message });
    //         // }
    //         // else {
    //         //     console.log('#else get into fenigeRes.body.status S0000#');
    //         //     var transactionDate = new Date('0000/00/00');
    //         //     var insertRes = await insertTransactionHistory(newTransactionSaved.id, '0.00', transactionDate, '', false, fenigeRes.body.message);

    //         //     insertRes = JSON.parse(JSON.stringify(insertRes));

    //         //     console.log('insertTransactionHistory resp in else :', insertRes);

    //         //     // reject({ "status": false, "message": fenigeRes.body.message ? fenigeRes.body.message : "Something went wrong!!, please try again." });
    //         // }
    //     }else{
    //         console.log('#get into this else#');
    //         // reject({ "status": false, "message": "Something went wrong!!, please try again." });
    //     }

    // }else{
    //     console.log("got fenigeRes.statusCode 400 BAD REQUEST ");
    // }

    return 'fenigeRes.body';
  }
}
