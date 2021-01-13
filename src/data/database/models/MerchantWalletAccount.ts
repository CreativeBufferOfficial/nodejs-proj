import {
  Table,
  Column,
  Model,
  PrimaryKey,
  ForeignKey,
  AutoIncrement,
  HasOne,
} from 'sequelize-typescript';
import CustomerDetails from './CustomerDetails';

@Table({
  freezeTableName: true,
  tableName: 'merchant_wallet_account',
})
class MerchantWalletAccount extends Model<MerchantWalletAccount> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id!: number;

  @ForeignKey(() => CustomerDetails)
  @Column
  customer_details_id!: number;

  @Column
  balance!: number;

  @Column
  symbol!: string;

  @Column
  createdAt!: Date;

  @Column
  updatedAt!: Date;

  @HasOne(() => CustomerDetails, { foreignKey: 'id', sourceKey: 'customer_details_id' })
  customer_details!: CustomerDetails;
}

export default MerchantWalletAccount;
