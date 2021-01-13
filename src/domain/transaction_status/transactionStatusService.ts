import TransactionStatus from '../../data/database/models/TransactionStatus';
import { ITransactionStatusRepository } from './ITransactionStatusRepository';

export class TransactionStatusService {
  constructor(private readonly transactionStatusRepository: ITransactionStatusRepository) { }

  async createTransactionStatus(
    transaction_id: number,
    clearing_amount: number,
    transaction_status: string,
    event_result: string,
    three_ds_confirmed: boolean,
    transaction_date: string,
    created_date: string,
  ): Promise<TransactionStatus> {
      return this.transactionStatusRepository.add(
        transaction_id,
        clearing_amount,
        transaction_status,
        event_result,
        three_ds_confirmed,
        transaction_date,
        created_date,
    );
  } 
}
