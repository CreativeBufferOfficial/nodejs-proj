import { Table, Column, Model, PrimaryKey } from 'sequelize-typescript';

@Table({
  freezeTableName: true,
  timestamps: false
})
class customer_kyc extends Model<customer_kyc> {

  @PrimaryKey
  @Column
  running_id!: number;

  @Column
  customer_id!: string;

  @Column
  first_name!: string;

  @Column
  last_name!: string;

  @Column
  ref_id!: string;

  @Column
  email!: string;

  @Column
  customer_ext_id!: string;

  @Column
  verification_type!: string;

  @Column
  customer_data_url!: string;

  @Column
  customer_case_id!: string;

  @Column
  case_id!: string;

  @Column
  status!: string;
  
  @Column
  address!: string;

  @Column
  user_id!: number;

  @Column({ field: 'company_uuid' })
  company_uuid!: string;
  
  @Column
  created_at!: Date;

  @Column
  updated_at!: Date;

  @Column
  deleted_at!: Date;
}

export default customer_kyc;