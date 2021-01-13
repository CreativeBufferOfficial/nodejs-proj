import { Table, Column, Model, PrimaryKey, HasOne, HasMany,  } from 'sequelize-typescript';

import CustomerDetails from './CustomerDetails';
import CustomerAccessAudit from './CustomerAccessAudit';
import SubUsers from './SubUsers';

 @Table
class user extends Model<user> {

  @PrimaryKey
  @Column
  id!: number;

  @Column
  email!: string;

  @Column
  password!: string;

  @Column
  is_active!: number;

  @Column
  createdAt!: Date;

  @Column
  updatedAt!: Date;

  @HasOne(() => CustomerDetails)
  customer_details!: CustomerDetails;

  @HasMany(() => CustomerAccessAudit)
  user_access_logs!: CustomerAccessAudit[];

  @HasMany(() => SubUsers, { foreignKey: 'parent_user_id' })
  sub_users!: SubUsers[];
}

export default user;