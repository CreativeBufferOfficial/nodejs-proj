import { Sequelize, SequelizeOptions } from 'sequelize-typescript';
import { config } from './../../configuration';

import User from './models/Users';
import SubUser from './models/SubUsers';
import CustomerDetails from './models/CustomerDetails';
import CustomerAccessAudit from './models/CustomerAccessAudit';
import AdminAccount from './models/AdminAccount';
import Transaction from './models/Transaction';
import COFRecurringTransaction from './models/COFRecurringTransaction';
import MerchantRequests from './models/MerchantRequests';
import TransactionStatus from './models/TransactionStatus';
import UserKYC from './models/UserKYC';
import TransactionRedirectURL from './models/TransactionRedirectUrl';
import BlockPassCustomerClientKYC from './models/BlockPassCustomerClientKYC';
import UnenrolledCard from './models/UnenrolledCard';
import PaymentRefund from './models/PaymentRefund';
import VolumeFailedTransactionLogs from './models/VolumeFailedTransactionLogs';
import CardFailedTransactionLogs from './models/CardFailedTransactionLogs';
import CardFailedTransactionLogsCounter from './models/CardFailedTransactionLogsCounter';
import RCDollarVolumeLog from './models/RCDollarVolumeLog';
import RiskControlGlobalConfig from './models/RiskControlGlobalConfig';
import Merchant from './models/Merchant';
import CryptoPurchase from './models/CryptoPurchase';
export {
  PaymentRefund,
  COFRecurringTransaction,
  MerchantRequests,
  Transaction,
  UnenrolledCard,
  User,
  VolumeFailedTransactionLogs,
  CardFailedTransactionLogs,
  CustomerDetails,
  TransactionStatus,
  CardFailedTransactionLogsCounter,
  RCDollarVolumeLog,
  RiskControlGlobalConfig,
  Merchant,
  TransactionRedirectURL,
  UserKYC,
  CryptoPurchase,
}
export class Database {
  sequelize?: Sequelize;
  // constructor(private readonly dbConfig : { database: any, dialect: any, username: any, password: any, modelsPath: any} ) {}
  constructor(private readonly dbConfig: SequelizeOptions) {
    // console.log(dbConfig.models, 'ddd')
  }
  async connect() {
    const { host, database, dialect, username, password } = this.dbConfig;
    this.sequelize = new Sequelize({
      host,
      database,
      dialect,
      username,
      password,
      models: [
        User,
        SubUser,
        CustomerDetails,
        CustomerAccessAudit,
        AdminAccount,
        Transaction,
        TransactionStatus,
        UserKYC,
        TransactionRedirectURL,
        BlockPassCustomerClientKYC,
        UnenrolledCard,
        MerchantRequests,
        COFRecurringTransaction,
        PaymentRefund,
        VolumeFailedTransactionLogs,
        CardFailedTransactionLogs,
        CardFailedTransactionLogsCounter,
        RCDollarVolumeLog,
        RiskControlGlobalConfig,
        Merchant,
        CryptoPurchase,
      ],
      // timezone: '+05:30'
    });
  }
}

export function databaseV2() {
  const sequelize = new Sequelize({
    host: config.DBHost, database: config.DBName, dialect: 'mysql', username: config.DBUser, password:  config.DBPassword,
    models: [
      User,
      SubUser,
      CustomerDetails,
      CustomerAccessAudit,
      AdminAccount,
      Transaction,
      TransactionStatus,
      UserKYC,
      TransactionRedirectURL,
      BlockPassCustomerClientKYC,
      UnenrolledCard,
      MerchantRequests,
      COFRecurringTransaction,
      PaymentRefund,
      VolumeFailedTransactionLogs,
      CardFailedTransactionLogs,
      CardFailedTransactionLogsCounter,
      RCDollarVolumeLog,
      RiskControlGlobalConfig,
      Merchant,
      CryptoPurchase,
    ],
    // timezone: '+05:30'
  });
  return sequelize;
}