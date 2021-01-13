import * as Awilix from 'awilix';

import { AppV2 } from './http/AppV2';
import Router from './http/router';

import { JSONCSVService, SESService, CryptoEngineService, FenigeService } from './services';
import { TransactionRepository } from './domain/transaction/transactionRepository';
import { TransactionServiceV2 } from './domain/transaction';
import { UsersServiceV2, UserRepository } from './domain/users';
import { BlockCardRepository, BlockCardService } from './domain/block-cards';
import { CustomerRepository, CustomerService } from './domain/customer';
import { UserKYCRepository, UserKYCServiceV2 } from './domain/user_kyc';
import { RiskControlRepository, RiskControlService } from './domain';

import { Database, databaseV2 } from './data/database';

import { CryptoEngine, PaymentRoute, StatsRoutes, CustomerSubUserRoute } from './http/routes';
import { HttpException } from './http/routes/errors';

import { config } from './configuration';
import { MerchantRepository } from './domain/merchant/merchantRepository';


const container = Awilix.createContainer({
  injectionMode: Awilix.InjectionMode.PROXY,
});

// export const createContainer = async (): Promise<Awilix.AwilixContainer> => {
  // const container = Awilix.createContainer({
  //   injectionMode: Awilix.InjectionMode.PROXY,
  // });

  container.register({
    cryptoEngine: Awilix.asClass(CryptoEngine).singleton(),
    paymentRoute: Awilix.asClass(PaymentRoute).singleton(),
    statsRoutes: Awilix.asClass(StatsRoutes).singleton(),
    customerSubUserRoute: Awilix.asClass(CustomerSubUserRoute).singleton(),
  });

  container.register({
    router: Awilix.asFunction(Router).singleton(),
    appV2: Awilix.asClass(AppV2).singleton(),
    sesService: Awilix.asClass(SESService).singleton(),
    jsoncsvService: Awilix.asClass(JSONCSVService).singleton(),
  });

  container.register({
    TransactionRepository: Awilix.asClass(TransactionRepository).singleton(),
    MerchantRepository: Awilix.asClass(MerchantRepository).singleton(),
    BlockCardRepository: Awilix.asClass(BlockCardRepository).singleton(),
    CustomerRepository: Awilix.asClass(CustomerRepository).singleton(),
    RiskControlRepository: Awilix.asClass(RiskControlRepository).singleton(),
    UserRepository: Awilix.asClass(UserRepository).singleton(),
    UserKYCRepository: Awilix.asClass(UserKYCRepository).singleton(),
  });

  container.register({
    TransactionServiceV2: Awilix.asClass(TransactionServiceV2).singleton(),
    UsersServiceV2: Awilix.asClass(UsersServiceV2).singleton(),
    BlockCardService: Awilix.asClass(BlockCardService).singleton(),
    CustomerService: Awilix.asClass(CustomerService).singleton(),
    RiskControlService: Awilix.asClass(RiskControlService).singleton(),
    CryptoEngineService: Awilix.asClass(CryptoEngineService).singleton(),
    FenigeService: Awilix.asClass(FenigeService).singleton(),
    UserKYCServiceV2: Awilix.asClass(UserKYCServiceV2).singleton(),
  });

  container.register({
    db: Awilix.asClass(Database).singleton(),
    db2: Awilix.asFunction(databaseV2).singleton(),
    HttpException: Awilix.asValue(HttpException),
    config: Awilix.asValue(config),
  });

  
  // return container;
// }

// let containerInstance: Awilix.AwilixContainer | null = null;

// if (!containerInstance) {
//   (async() => {
//     containerInstance = await createContainer();
//   })()
// }
const containerInstance = container;
export { containerInstance, container, };
