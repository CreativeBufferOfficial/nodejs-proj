import { Table, Column, Model, PrimaryKey, BelongsTo, ForeignKey, HasOne, HasMany  } from 'sequelize-typescript';

import User from './Users';
import CustomerDetails from './CustomerDetails';
import CustomerAccessAudit from './CustomerAccessAudit';

@Table({
   freezeTableName: true,
   timestamps: false
 })
class subusers extends Model<subusers> {

  @PrimaryKey
  @Column
  id!: number;

  @Column
  email!: string;

  @Column
  password!: string;

  @Column
  is_active!: number;

  @ForeignKey(() => User)
  @Column
  parent_user_id!: number;

  @Column
  first_name!: string;
  
  @Column
  last_name!: string;

  @Column
  created_at!: Date;

  @Column
  updated_at!: Date;

  @HasOne(() => CustomerDetails, { foreignKey: 'user_id', sourceKey: 'parent_user_id' })
  customer_details!: CustomerDetails;

  @HasMany(() => CustomerAccessAudit, { foreignKey: 'user_id', sourceKey: 'parent_user_id' })
  user_access_logs!: CustomerAccessAudit[];

  @BelongsTo(() => User)
  user!: User;
}

export default subusers;