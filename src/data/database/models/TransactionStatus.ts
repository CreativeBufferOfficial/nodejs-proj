import {
  Table,
  Column,
  Model,
  PrimaryKey,
  ForeignKey,
  AutoIncrement,
  BelongsTo,
  // HasOne
} from 'sequelize-typescript';

import Transaction from './Transaction';
@Table({
  freezeTableName: true,
  timestamps: false
})
class transaction_status extends Model<transaction_status> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id!: number;

  @ForeignKey(() => Transaction)
  @Column
  transaction_id!: number;

  @Column
  transaction_status!: string;

  @Column
  event_result!: string;

  @Column
  three_ds_confirmed!: boolean;

  @Column
  clearing_amount!: string;

  @Column
  transaction_date!: Date;

  @Column
  createdAt!: Date;

  @BelongsTo(() => Transaction)
  transaction!: Transaction;
}

export default transaction_status;
