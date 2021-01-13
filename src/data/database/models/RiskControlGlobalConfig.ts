import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
} from 'sequelize-typescript';

@Table({
  freezeTableName: true,
  tableName: 'risk_control_global_config',
})
class RiskControlGlobalConfig extends Model<RiskControlGlobalConfig> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id!: number;

  @Column
  enabled!: boolean;

  @Column({ field: 'created_at' })
  createdAt!: Date;

  @Column({ field: 'updated_at' })
  updatedAt!: Date;

}

export default RiskControlGlobalConfig;
