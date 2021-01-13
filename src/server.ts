// import express from 'express';
import { config } from './configuration';
import { appFactory } from './http/app';
import { logger } from './libs/logger';
import passport from './libs/passport';

import { UserRepository } from './domain/users/userRepository';

import { UsersService } from './domain/users/usersService';
import { MerchantService } from './domain/merchant/merchantService';
import { CustomerAccessAuditRepository } from './domain/customer_access_audit/CustomerAccessAuditRepository';
import { CustomerAccessAuditService } from './domain/customer_access_audit/CustomerAccessAuditService';
import { AdminAccountRepository } from './domain/admin_account/AdminAccountRepository';
import { AdminAccountService } from './domain/admin_account/AdminAccountService';


import { TransactionRepository } from './domain/transaction/transactionRepository';

import { TransactionService } from './domain/transaction/transactionService';

import { TransactionStatusRepository } from './domain/transaction_status/transactionStatusRepository';
import { TransactionStatusService } from './domain/transaction_status/transactionStatusService';

import { UserKYCService, UserKYCRepository } from './domain/user_kyc';

import { getCustomerDetailsCompanyUUID } from './domain/customer/customerDetails';
import { init } from './signals';
import { Database } from './data/database';
import { MerchantRepository } from './domain/merchant/merchantRepository';

// const database = new Database({ database:  'sample_db', dialect:  'mysql', username:  'root', password:  'my-secret-pw', });
const database = new Database({ host: config.DBHost, database: config.DBName, dialect: 'mysql', username: config.DBUser, password:  config.DBPassword });
database.connect();

const customerAccessAuditRepository = new CustomerAccessAuditRepository();
const customerAccessAuditService = new CustomerAccessAuditService(customerAccessAuditRepository);
const userRepository = new UserRepository();
const userService = new UsersService(userRepository);

const merchantRepository = new MerchantRepository();
const merchantService = new MerchantService(merchantRepository);


const transactionRepository = new TransactionRepository();
const transactionService = new TransactionService(transactionRepository);

const transactionStatusRepository = new TransactionStatusRepository();
const transactionStatusService = new TransactionStatusService(transactionStatusRepository);

const adminAccountRepository = new AdminAccountRepository();
const adminAccountService = new AdminAccountService(adminAccountRepository);

const userKYCService = new UserKYCService(new UserKYCRepository());

const app = appFactory({ userService, merchantService, customerAccessAuditService, adminAccountService, transactionService, transactionStatusService, userKYCService, libs: { passport, logger, getCustomerDetailsCompanyUUID } });

(async () => {
  const server = app.listen(config.port, async () => {
    logger.info(`Listening on *:${config.port}`);
  });
  const shutdown = init(() => {
    server.close(async () => {
      // await database.disconnect();
    });
  });
  
  
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
})()

