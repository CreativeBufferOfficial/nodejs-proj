import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
} from 'sequelize-typescript';

@Table({
  freezeTableName: true,
  tableName: 'risk_control_dollar_volume_logs',
})
class RCDollarVolumeLog extends Model<RCDollarVolumeLog> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id!: number;

  @Column
  volume!: number;

  @Column({ field: 'created_at' })
  createdAt!: Date;

  @Column({ field: 'updated_at' })
  updatedAt!: Date;
}

export default RCDollarVolumeLog;
