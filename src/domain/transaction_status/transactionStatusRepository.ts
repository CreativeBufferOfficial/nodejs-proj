import TransactionStatus from '../../data/database/models/TransactionStatus';
import Joi from '@hapi/joi';

export class TransactionStatusRepository {

  async add(
    transaction_id: number,
    clearing_amount: number,
    transaction_status: string,
    event_result: string,
    three_ds_confirmed: boolean,
    transaction_date: string,
    created_date: string,
  ): Promise<TransactionStatus> {

    const schema = Joi.object({
        transaction_id: Joi.number().required(),
        clearing_amount: Joi.number().required(),
        transaction_status: Joi.string().required(),
        event_result: Joi.string().required(),
        three_ds_confirmed: Joi.boolean().required(),
        transaction_date: Joi.string().required(),
        created_date: Joi.string().required(),
    });

    const { error } = schema.validate({ 
      transaction_id,
      clearing_amount,
      transaction_status,
      event_result,
      three_ds_confirmed,
      transaction_date,
      created_date,
      }, { abortEarly: false });
    if (error) {
      const errorMsg =  error.details.map((e: any) => {
        // console.log(e)
        // console.log(e.context.key, 'fdffdfqqq')
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

    const newTransactionStatus = new TransactionStatus({
        transaction_id: transaction_id,
        clearing_amount: clearing_amount,
        transaction_status: transaction_status,
        event_result: event_result,
        three_ds_confirmed: three_ds_confirmed,
        transaction_date: transaction_date,
        created_date: new Date(),
    });

 
    const newTransactionStatusSaved = await newTransactionStatus.save();
 
    return newTransactionStatusSaved!;
  }

}
