import { Table, Column, Model, PrimaryKey, AutoIncrement } from 'sequelize-typescript';

 @Table({
  tableName: 'merchant_requests',
  freezeTableName: true,
})
class MerchantRequests extends Model<MerchantRequests> {

  @PrimaryKey
  @AutoIncrement
  @Column
  id!: number;

  @Column
  first_name!: string;

  @Column
  last_name!: string;

  @Column
  company!: string;

  @Column
  email!: string;

  @Column({ field: 'signup_notification_sent' })
  signUpNotificationSent!: number;

  @Column({ field: 'application_completed' })
  applicationCompleted!: number;
  
  @Column({ field: 'application_completion_date' })
  applicationCompletionDate!: Date;

  @Column({ field: 'merchant_approved' })
  merchantApproved!: boolean;

  @Column({ field: 'created_at' })
  createdAt!: Date;

  @Column({ field: 'updated_at' })
  updatedAt!: Date;
}

export default MerchantRequests;
