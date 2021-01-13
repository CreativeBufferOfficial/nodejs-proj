import { Table, Column, Model, PrimaryKey, HasOne, } from 'sequelize-typescript';

import CardFailedTransactionLogs from './CardFailedTransactionLogs';
 @Table({
  freezeTableName: true,
  timestamps: false,
  tableName: 'unenrolled_cardlist'
})
class UnenrolledCard extends Model<UnenrolledCard> {

  @PrimaryKey
  @Column
  id!: number;

  @Column
  card!: string;

  @Column({ field: 'company_UUID' })
  companyUUID!: string;

  @Column
  enrolled_status!: string;

  @Column({ field: 'created_at' })
  createdAt!: Date;

  @Column({ field: 'updated_at' })
  updatedAt!: Date;

  @HasOne(() => CardFailedTransactionLogs, { foreignKey: 'unenrolled_card_id', sourceKey: 'id' })
  blocked_card_transaction_log!: CardFailedTransactionLogs;
}
// UnenrolledCard.hasOne(CardFailedTransactionLogs, { 
//   as: 'xxx',
//   foreignKey: 'unenrolled_card_id',
//   sourceKey: 'id',
// });
export default UnenrolledCard;