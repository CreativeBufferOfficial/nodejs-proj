import { Table, Column, Model, PrimaryKey, ForeignKey, HasOne } from 'sequelize-typescript';

import UnenrolledCard from './UnenrolledCard';

 @Table({
  freezeTableName: true,
  timestamps: true,
  tableName: 'card_failed_transaction_logs'
})
class CardFailedTransactionLogs extends Model<CardFailedTransactionLogs> {

  @PrimaryKey
  @Column
  id!: number;

  @Column
  user_email!: string;

  @ForeignKey(() => UnenrolledCard)
  @Column
  card_number!: string;

  @Column
  attempts!: number;

  @Column
  status!: number;

  @Column
  latest_alert_sent!: string;

  @Column
  is_read!: boolean;

  @Column
  unenrolled_card_id!: number;

  @Column
  request_uuid!: string;

  @Column({ field: 'created_at' })
  createdAt!: Date;

  @Column({ field: 'updated_at' })
  updatedAt!: Date;

  // @BelongsTo(() => UnenrolledCard)
  // unenrolled_card!: UnenrolledCard;

  @HasOne(() => UnenrolledCard, { foreignKey: 'id', sourceKey: 'unenrolled_card_id' })
  unenrolled_card!: UnenrolledCard;
}

export default CardFailedTransactionLogs;