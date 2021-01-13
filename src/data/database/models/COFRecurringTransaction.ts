import {
  Table,
  Column,
  Model,
  PrimaryKey,
  ForeignKey,
  AutoIncrement,
  BelongsTo,
} from 'sequelize-typescript';
import CustomerDetails from './CustomerDetails';

@Table({
  freezeTableName: true,
  timestamps: false,
  tableName: 'cof_recurring_transactions'
})
class COFRecurringTransaction extends Model<COFRecurringTransaction> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id!: number;

  @Column
  adax_uuid!: string;

  @ForeignKey(() => CustomerDetails)
  @Column
  customer_details_id!: number;

  @Column
  request_uuid!: string;

  @Column
  merchant_uuid!: string;

  @Column
  first_name!: string;

  @Column
  last_name!: string;

  @Column
  email!: string;

  @Column
  address_ip!: string;

  @Column
  amount!: number;

  @Column
  fees!: number;


  @Column
  currency!: string;

  @Column
  transaction_status!: string;

  @Column
  initial_uuid!: string;

  @Column
  transaction_type!: string;

  @Column
  auto_clear!: boolean;

  @Column
  refund_status!: string;
  
  @Column
  createdAt!: Date;

  @Column
  updatedAt!: Date;

  @BelongsTo(() => CustomerDetails)
  customer_details!: CustomerDetails;
}

export default COFRecurringTransaction;
