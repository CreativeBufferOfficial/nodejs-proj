import { Table, Column, Model, PrimaryKey } from 'sequelize-typescript';

@Table({
  tableName: 'crypto_purchase',
  freezeTableName: true,
})
class CryptoPurchase extends Model<CryptoPurchase> {

  @PrimaryKey
  @Column
  id!: number;

  @Column({ field: 'request_uuid' })
  requestUUID!: string;

  @Column({ field: 'email' })
  email!: string;

  @Column({ field: 'company_uuid' })
  companyUUID!: string;

  @Column({ field: 'quote_price' })
  quotePrice!: number;

  @Column({ field: 'original_purchased_price' })
  originalPurchasedPrice!: number;

  @Column({ field: 'markup_fee' })
  markupFee!: number;

  @Column({ field: 'markup_fee_percentage' })
  markupFeePercentage!: number;

  @Column({ field: 'final_price' })
  finalPrice!: number;

  @Column({ field: 'quantity' })
  quantity!: number;

  @Column({ field: 'base_currency' })
  baseCurrency!: string;

  @Column({ field: 'quote_currency' })
  quoteCurrency!: string;

  @Column({ field: 'proceeds_currency' })
  proceedsCurrency!: string;

  @Column({ field: 'destination_wallet_address' })
  wallet!: string;

  @Column({ field: 'tx_id' })
  txId!: string;

  @Column({ field: 'transferred' })
  transferred!: boolean;

  /**
   *  1 - OPEN - initial process/quote created
   *  2 - READY - payment approved/cleared
   *  3 - IN PROCESS - processing by the background job
   *  4 - COMPLETED - transferred
   *  5 - Declined
   */
  @Column({ field: 'status' })
  status!: number;

  @Column({ field: 'initial_transfer' })
  initialTransfer!: boolean;

  @Column({ field: 'requested_at' })
  requestedAt!: Date;

  @Column({ field: 'quoted_at' })
  quotedAt!: Date;


  @Column({ field: 'fully_settled_at' })
  fullySettledAt!: Date;

  @Column({ field: 'created_at' })
  createdAt!: Date;

  @Column({ field: 'updated_at' })
  updatedAt!: Date;
}

export default CryptoPurchase;