import TransactionStatus from '../../data/database/models/TransactionStatus';

export interface ITransactionStatusRepository {
  add(
    transaction_id: number,
    clearing_amount: number,
    transaction_status: string,
    event_result: string,
    three_ds_confirmed: boolean,
    transaction_date: string,
    created_date: string,
  ): Promise<TransactionStatus>;
}
