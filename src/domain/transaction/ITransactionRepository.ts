import { COFRecurringTransaction, PaymentRefund  } from '../../data/database';
import Transaction from '../../data/database/models/Transaction';
import { IVolumeFailedTransactionLogsRequest, IVolumeFailedTransactionLogsResponse } from './Transaction.domain';

interface BaseTransactionParams {
  company_uuid: string,
  customer_details_id?: number,
  request_uuid: string,
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
}

export interface CreateParams extends BaseTransactionParams {
  merchant_uuid?: string;
  response_code?: string;
  event_result?: string;
}

export interface ITransactionRepository {
  add(
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
  ): Promise<any>;

  addCOFROFTransaction(
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
  ): Promise<any>;

  addSubsequentCOFOrRecurringPayment(
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
  ): Promise<any>;

  TransactionByRequestUUID( request_uuid: string ): Promise<Transaction | null>;
  TransactionByIntialUUID( initial_uuid: string ): Promise<Transaction | null>;
  TransactionByRequestUUIDs( request_uuids: string[] ): Promise<Transaction[] | []>;
  getCOFROCTransactionsByUUIDs( request_uuids: string[] ): Promise<COFRecurringTransaction[]>;
  getCOFROCTransactionsByUUID( request_uuid: string ): Promise<COFRecurringTransaction | null>;
  getPaymentRefundByRequestUUID( request_uuid: string ): Promise<PaymentRefund | null>;
  getVolumeFailedTransactionLogs ({
    searchQuery,
    orderByField,
    orderSort,
    page,
    limit,
  }: IVolumeFailedTransactionLogsRequest
    // searchQuery: string,
    // orderByField: string,
    // orderSort: string,
    // page: number,
    // limit: number,
  ): Promise<IVolumeFailedTransactionLogsResponse>;
  // paymentRefund(requestUuid: string, amountToRefund: number): Promise<any>
  checkCardTransactions24Hr (
    transactionStatus: string,
    responseCode: string,
    card_number: string, 
    companyUUID: string,
    request_uuid: string,
    user_email: string,
  ): Promise<void>;
  checkDeclinedTransactions (transactionStatus: string, adaxUUID: string): Promise<void>
  check24HrVolume (transactionStatus: string, adaxUUID: string): Promise<void>
  volumeByDollarAmountChecker (): Promise<void>
  saveTransaction(transaction: Transaction): Promise<boolean>
  checkExistReqestUuid(request_uuid: string): Promise<any>;
  create(data: CreateParams): Promise<any>;
}
