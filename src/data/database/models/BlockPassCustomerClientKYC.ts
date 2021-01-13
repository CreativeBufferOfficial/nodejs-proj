import { Table, Column, Model, PrimaryKey } from 'sequelize-typescript';

@Table({
  freezeTableName: true,
  timestamps: false,
  tableName: 'blockpass_customer_client_kyc',
})
class BlockPassCustomerClientKYC extends Model<BlockPassCustomerClientKYC> {

  @PrimaryKey
  @Column
  id!: number;
  
  @Column
  email!: string;

  @Column
  refId!: string;

  @Column
  status!: string;

  @Column({ field: 'user_id' })
  userId!: string;
  
  @Column
  created_at!: Date;

  @Column
  updated_at!: Date;

  @Column
  deleted_at!: Date;
}

export default BlockPassCustomerClientKYC;