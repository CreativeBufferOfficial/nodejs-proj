import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  // BelongsTo,
  // ForeignKey,
} from 'sequelize-typescript';
// import Transaction from './Transaction';

@Table({
  freezeTableName: true,
  timestamps: false,
  tableName: 'payment_transaction_refunds'
})
class PaymentRefund extends Model<PaymentRefund> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id!: number;

  @Column
  adax_uuid!: string;

  @Column
  request_uuid!: string;

  @Column
  amount!: number;

  @Column
  refund_status!: string;

  @Column
  response_code!: string;

  // @ForeignKey(() => Transaction)
  // @Column
  // transaction_id!: number;

  @Column
  createdAt!: Date;

  @Column
  updatedAt!: Date;

  // @BelongsTo(() => Transaction)
  // transactions!: Transaction;
}

export default PaymentRefund;
