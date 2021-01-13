import { Table, Column, Model, PrimaryKey } from 'sequelize-typescript';

 @Table({
  freezeTableName: true,
  timestamps: true,
  tableName: 'card_failed_logs_counter'
})
class CardFailedTransactionLogsCounter extends Model<CardFailedTransactionLogsCounter> {

  @PrimaryKey
  @Column
  id!: number;

  @Column
  company_uuid!: string;

  @Column
  declined_attempts!: number;

  @Column
  declined_updated_at!: Date;

  @Column
  no_auth_attempts!: number;

  @Column
  no_auth_updated_at!: Date;

  @Column
  waiting_verify_attempts!: number;

  @Column
  waiting_verify_updated_at!: Date;

  @Column
  unenrolled_card_id!: number;

  @Column({ field: 'created_at' })
  createdAt!: Date;

  @Column({ field: 'updated_at' })
  updatedAt!: Date;

  // @BelongsTo(() => UnenrolledCard)
  // unenrolled_card!: UnenrolledCard;

  // @HasOne(() => UnenrolledCard, { foreignKey: 'id', sourceKey: 'unenrolled_card_id' })
  // unenrolled_card!: UnenrolledCard;
}

export default CardFailedTransactionLogsCounter;