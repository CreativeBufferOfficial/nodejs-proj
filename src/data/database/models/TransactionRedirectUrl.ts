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
})
class transaction_redirect_url extends Model<transaction_redirect_url> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id!: number;

  @Column
  redirect_url!: string;

  @ForeignKey(() => Transaction)
  @Column
  transaction_id!: number;

  @Column
  createdAt!: Date;

  @Column
  updatedAt!: Date;

  @BelongsTo(() => Transaction)
  transaction!: Transaction;

}

export default transaction_redirect_url;
