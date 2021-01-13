import { Router } from 'express';
import passport from 'passport';
import { riskControlRoutes } from './routes/risk-control';
import { customerAdminRoutes } from './routes/admin/customers';
import { ICryptoEngine, IPaymentRoute, IStatsRoutes, ICustomerSubUserRoute } from './routes';
import { successResponseMiddleware } from './routes/middlewares';
import { errorHandler } from './routes/errors';

import { ITransactionServiceV2 } from '../domain/transaction';
import { IBlockCardService } from '../domain/block-cards';
import { ICustomerService } from '../domain/customer';
import { IRiskControlService } from '../domain/risk-control';
// import { UsersService } from '../domain/users';

import { IFenigeService } from './../services';

interface Dependencies {
  TransactionServiceV2: ITransactionServiceV2
  BlockCardService: IBlockCardService,
  CustomerService: ICustomerService,
  RiskControlService: IRiskControlService,
  cryptoEngine: ICryptoEngine,
  paymentRoute: IPaymentRoute,
  statsRoutes: IStatsRoutes,
  FenigeService: IFenigeService,
  customerSubUserRoute: ICustomerSubUserRoute,
  // usersService: typeof UsersService,
}

export default (deps: Dependencies) => {
  const {
    TransactionServiceV2,
    BlockCardService,
    CustomerService,
    RiskControlService,
    cryptoEngine,
    paymentRoute,
    statsRoutes,
    customerSubUserRoute,
    // usersService,
  } = deps;
  const router = Router();

  const apiRouter = Router();
  const adminRouter = Router();

  apiRouter.use('/admin', adminRouter);
  router.use('/api', apiRouter);
  
  const customerAdminRouter = customerAdminRoutes({ CustomerService });
  adminRouter.use(
    '/customers',
    passport.authenticate('admin', { session: false }),
    customerAdminRouter,
  );
  
  const riskControlRouter = riskControlRoutes({ TransactionServiceV2, BlockCardService, RiskControlService });
  apiRouter.use('/risk-control', 
    passport.authenticate('admin', { session: false }),
    riskControlRouter
  );

  // new routes implementation strategy
  apiRouter.use('/crypto-engine', cryptoEngine.routes());
  apiRouter.use('/payment', paymentRoute.routes());
  apiRouter.use(
    '/stats',
    passport.authenticate('jwt', { session: false }),
    statsRoutes.routes()
  );
  apiRouter.use(
    '/sub-user',
    passport.authenticate('jwt', { session: false }),
    customerSubUserRoute.routes()
  );

  apiRouter.use(successResponseMiddleware);
  apiRouter.use(errorHandler);
  return router;
}