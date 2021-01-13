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
  tableName: 'volume_failed_transaction_logs',
})
class VolumeFailedTransactionLogs extends Model<VolumeFailedTransactionLogs> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id!: number;

  @ForeignKey(() => CustomerDetails)
  @Column
  customer_details_id!: number;

  @Column
  transaction_volume!: number;

  @Column
  rc1!: number;

  @Column
  rc2!: number;

  @Column
  rc3!: number;

  @Column
  rc4!: number;

  @Column
  status!: string;

  @Column
  latest_alert_sent!: string;

  @Column
  createdAt!: Date;

  @Column
  updatedAt!: Date;

  @HasOne(() => CustomerDetails, { foreignKey: 'id', sourceKey: 'customer_details_id' })
  customer_details!: CustomerDetails;
}

export default VolumeFailedTransactionLogs;
