import { Table, Column, Model, PrimaryKey } from 'sequelize-typescript';

 @Table
class admin_account extends Model<admin_account> {

  @PrimaryKey
  @Column
  id!: number;

  @Column
  username!: string;

  @Column
  password!: string;

  @Column
  name!: string;

  @Column
  is_active!: number;

  @Column
  status!: number;

  @Column
  createdAt!: Date;

  @Column
  updatedAt!: Date;
}

export default admin_account;