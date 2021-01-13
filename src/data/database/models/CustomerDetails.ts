import { 
  Table, 
  Column, 
  Model, 
  PrimaryKey, 
  ForeignKey, 
  BelongsTo, 
  HasMany,
  DataType
} from 'sequelize-typescript';

import User from './Users';
import SubUser from './SubUsers';
import Transaction from './Transaction';
import COFRecurringTransaction from './COFRecurringTransaction';
import Merchant from './Merchant';
@Table
class customer_details extends Model<customer_details> {

  @PrimaryKey
  @Column
  id!: number;

  @Column
  company_uuid!: string;

  @Column
  term_uuid!: string;

  @Column
  term_url!: string;

  @Column
  company_name!: string;

  @Column
  contact_person!: string;

  @Column
  address!: string;

  @Column
  contact_vat_tax_id!: string;

  @Column
  currency!: string;

  @Column
  fees!: number;

  @Column
  ip_address!: string;

  @Column
  merchant_id!: number;

  @ForeignKey(() => User)
  @Column
  user_id!: number;

  @Column
  is_active!: number;

  @Column({ type: DataType.FLOAT })
  amount_threshold!: number;

  @Column
  is_kyc_active!: boolean;

  @Column({ field: 'callback_url' })
  callback_url!: string;

  @Column({ field: 'webhook_endpoint' })
  webhook_endpoint!: string;
  
  @Column
  createdAt!: Date;

  @Column
  updatedAt!: Date;

  @BelongsTo(() => User)
  user!: User;

  @BelongsTo(() => SubUser, { foreignKey: 'user_id', targetKey: 'parent_user_id' })
  sub_user!: SubUser;

  @HasMany(() => Transaction)
  transactions!: Transaction[];

  @HasMany(() => COFRecurringTransaction)
  cof_rof_transactions!: COFRecurringTransaction[];

  @BelongsTo(() => Merchant, { foreignKey: 'merchant_id', targetKey: 'id' })
  merchant!: Merchant;
  // @HasOne(() => User, { foreignKey: 'user_id' })
  // detail_user!: User;
}
export default customer_details;