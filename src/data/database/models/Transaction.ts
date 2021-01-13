import {
  Table,
  Column,
  Model,
  PrimaryKey,
  HasMany,
  ForeignKey,
  AutoIncrement,
  BelongsTo,
  HasOne
} from 'sequelize-typescript';
import CustomerDetails from './CustomerDetails';
import TransactionStatus from './TransactionStatus';
import TransactionRedirectURL from './TransactionRedirectUrl';
import CryptoPurchase from './CryptoPurchase';

@Table({
  freezeTableName: true,
})
class transaction extends Model<transaction> {
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
  currency!: string;

  @Column
  card_number!: string;

  @Column
  expiry_date!: string;

  @Column
  cvc2!: string;

  @Column
  transaction_status!: string;

  @Column
  response_code!: string;

  @Column
  event_result!: string;

  @Column
  auto_clear!: boolean;

  @Column
  cof_rof_initial_uuid!: string;

  @Column
  fees!: number;

  @Column
  refund_status!: string;

  @Column
  crypto_transfer!: boolean;

  @Column
  crypto_settled!: boolean;

  @Column
  kyc_delayed!: boolean;

  @Column({ field: 'destination_wallet_address' })
  wallet!: string;

  @Column
  createdAt!: Date;

  @Column
  updatedAt!: Date;

  @BelongsTo(() => CustomerDetails)
  customer_details!: CustomerDetails;

  @HasMany(() => TransactionStatus)
  transaction_statuss!: TransactionStatus[];

  @HasOne(() => TransactionRedirectURL, { foreignKey: 'transaction_id' })
  transaction_redirect_url!: TransactionRedirectURL;

  @HasOne(() => CryptoPurchase, { foreignKey: 'request_uuid', sourceKey: 'request_uuid' })
  cryptoPurchase!: CryptoPurchase;
  // @HasOne(() => CustomerDetails, { foreignKey: 'customer_details_id' })
  // customer_details!: CustomerDetails;
}

export default transaction;
