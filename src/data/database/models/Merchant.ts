import { Table, Column, Model, PrimaryKey } from 'sequelize-typescript';

 @Table({
  tableName: 'merchants',
  freezeTableName: true,
})
class Merchant extends Model<Merchant> {

  @PrimaryKey
  @Column
  id!: number;

  @Column({ field: 'merchant_uuid' })
  merchantUUID!: string;

  @Column({ field: 'username' })
  username!: string;

  @Column({ field: 'password' })
  password!: string;

  @Column
  active!: boolean;

  @Column({ field: 'created_at' })
  createdAt!: Date;

  @Column({ field: 'updated_at' })
  updatedAt!: Date;
}

export default Merchant;