import { ITransactionRepository, IVolumeFailedTransactionLogsResponse, IVolumeFailedTransactionLogsRequest } from './../transaction';

import {
  CustomerDetails,
  Merchant,
  TransactionRedirectURL,
  UnenrolledCard,
  RiskControlGlobalConfig,
  UserKYC,
} from '../../data/database';

import { CreateParams } from './ITransactionRepository';
import { IFenigeService, ICryptoEngineService } from './../../services';
import { objToEncodedURI } from './../../utils';

export interface ITransactionServiceV2 {
  getVolumeFailedTransactionLogs({
    searchQuery,
    orderByField,
    orderSort,
    page,
    limit,
  }: IVolumeFailedTransactionLogsRequest): Promise<IVolumeFailedTransactionLogsResponse>
  createTransaction(data: CreateParams): Promise<any>
}

interface TransactionServiceV2Deps {
  TransactionRepository: ITransactionRepository;
  FenigeService: IFenigeService;
  CryptoEngineService: ICryptoEngineService;
}

type createTransactionParams = Omit<CreateParams, 'customer_details_id'>

export class TransactionServiceV2 implements ITransactionServiceV2 {
  private transactionRepository: ITransactionRepository;
  private fenigeService: IFenigeService;
  private cryptoEngineService: ICryptoEngineService;

  constructor({ TransactionRepository, FenigeService, CryptoEngineService }: TransactionServiceV2Deps) {
    this.transactionRepository = TransactionRepository;
    this.fenigeService = FenigeService;
    this.cryptoEngineService = CryptoEngineService;
  }

  async getVolumeFailedTransactionLogs({
    searchQuery,
    orderByField,
    orderSort,
    page,
    limit,
  }: IVolumeFailedTransactionLogsRequest): Promise<IVolumeFailedTransactionLogsResponse> {
    return await this.transactionRepository.getVolumeFailedTransactionLogs({
      searchQuery,
      orderByField,
      orderSort,
      page,
      limit,
    });
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

  async createTransaction(data: createTransactionParams): Promise<any> {
    // CHECK IF CARD 3DS ENROLLED
    if (data.card_number) {
      const cardStatus = await this.getUnenrolledCardStatus(data.card_number, data.company_uuid);
      if (cardStatus.status !== 'Y') {
        if (data.crypto_transfer) {
          await this.cryptoEngineService.markCancelled({ requestUUID: String(data.request_uuid) });
        }
        throw({ code: 422, message: cardStatus.message });
      }
    }
    const checkExist = await this.transactionRepository.checkExistReqestUuid(data.request_uuid);
    if (checkExist) {
      throw({ code: 422, message: 'Reqeust uuid alread exists.' });
    }
    const customerDetails = await CustomerDetails.findOne({
      where: {
        company_uuid: data.company_uuid,
      },
      include: [Merchant]
    });
    if (!customerDetails) {
      throw({ code: 422, message: 'Unable to find customer details' });
    }

    if (customerDetails.is_active !== 1) {
      throw({ code: 404, message: "Customer is either inactive or paused." });
    }


    if (customerDetails.is_kyc_active && (+data.amount/100) > customerDetails.amount_threshold) { // placeholder for amount validation
      const customerClientKYC = await UserKYC.findOne({ where: { company_uuid: data.company_uuid, email: data.email } });
      if (!customerClientKYC) {
        throw({ code: 404, message: 'Your KYC application doesn\'t exist from the company, please try again or contact support.' });
      }

      if (customerClientKYC && !['verified-status', 'approved'].includes(customerClientKYC.status.toLocaleLowerCase())) {
        throw({ code: 422, message: "Please perform KYC before you transact." });
      }
    }

    if (data.crypto_transfer) {
      const queryString = objToEncodedURI({ requestUUID: String(data.request_uuid), companyUUID: String(data.company_uuid) })
      const cryptoPurchaseDetails = await this.cryptoEngineService.getStatus({ queryString });
      if (!cryptoPurchaseDetails) {
          throw({ code: 404, message: "Invalid request uuid" });
      }
      if (
          cryptoPurchaseDetails.result.email !== data.email ||
          cryptoPurchaseDetails.result.wallet !== data.wallet
          // cryptoPurchaseDetails.result.originalPurchasedPrice !== (data.amount / 100)
      ) {
        throw({ status: 422, message: "Request data does not match quoted data." });
      }
  }

    // CALL FENIGE 3DS AUTH
    const fenige3DSAuth = await this.fenigeService.payment3DSAuth({
      requestUuid: data.request_uuid,
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email,
      addressIp: data.address_ip,
      amount: data.amount,
      currency: data.currency,
      cardNumber: data.card_number,
      expiryDate: data.expiry_date,
      cvc2: data.cvc2,
      autoClear: data.auto_clear,
      fenigeUsername: customerDetails.merchant.username,
      fenigePassword: customerDetails.merchant.password,
      merchantUUID: customerDetails.merchant.merchantUUID,
    });


    let fees = (+data.amount / 100) * (customerDetails.fees / 100);
    fees = fees > 2.99 ? fees : 2.99;

    // SAVE TRANSACTION DATA
    const createData = await this.transactionRepository.create({
      ...data,
      fees,
      customer_details_id: customerDetails.id,
      merchant_uuid: customerDetails.merchant.merchantUUID,
      transaction_status: fenige3DSAuth.transactionStatus,
      response_code: fenige3DSAuth.response_code,
      event_result: fenige3DSAuth.message,
    });

    const riskControlGlobalConfig = await RiskControlGlobalConfig.findOne();
    if (riskControlGlobalConfig && riskControlGlobalConfig.enabled) {
      // await this.transactionRepository.checkCardTransactions24Hr(fenige3DSAuth.transactionStatus, fenigeRes.body.responseCode, card_number, adax_uuid, request_uuid, email);
      await this.transactionRepository.checkDeclinedTransactions(fenige3DSAuth.transactionStatus, data.company_uuid);
    }

    const newTransactionRedirectURL = new TransactionRedirectURL({
      redirect_url: data.redirect_url,
      transaction_id: createData.id,
    });
    await newTransactionRedirectURL.save();
    return fenige3DSAuth;
  }
}