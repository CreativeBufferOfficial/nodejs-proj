import { Table, Column, Model, PrimaryKey, ForeignKey, BelongsTo, } from 'sequelize-typescript';

import User from './Users';
import SubUser from './SubUsers';

@Table
class customer_access_audits extends Model<customer_access_audits> {

  @PrimaryKey
  @Column
  id!: number;

  @Column
  ip_address!: string;

  @Column
  customer_location!: string;

  @Column
  customer_machine!: string;

  @Column
  is_parent_user!: boolean;
  
  @ForeignKey(() => User)
  @Column
  user_id!: number;

  @Column
  createdAt!: Date;

  @Column
  updatedAt!: Date;

  @BelongsTo(() => User)
  user!: User;

  @BelongsTo(() => SubUser, { foreignKey: 'user_id', targetKey: 'parent_user_id' })
  sub_user!: SubUser;

  // @HasOne(() => User, { foreignKey: 'user_id' })
  // detail_user!: User;
}

export default customer_access_audits;