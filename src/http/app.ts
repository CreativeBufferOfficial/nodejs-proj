import { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import useragent from 'express-useragent';
import { UsersService } from '../domain/users/usersService';
import { MerchantService } from '../domain/merchant/merchantService';
import { TransactionService } from '../domain/transaction/transactionService';
import { CustomerAccessAuditService } from '../domain/customer_access_audit/CustomerAccessAuditService';
import { AdminAccountService } from '../domain/admin_account/AdminAccountService';
// import { errorHandler } from './routes/error';
import { userRoute } from './routes/user';
import { merchantRoute } from './routes/merchant';
import { authRoute } from './routes/auth';
import { userKYCRoute } from './routes/user_kyc';
import { transactionRoute } from './routes/transaction';
import { PaymentRouter } from './routes/payment';
import { getloginEvents } from '../domain/customer_access_audit/CustomerAccessAuditService';
import { getCallEvents } from '../domain/transaction/transactionService';
import * as transactionStatus from '../domain/transaction_status/transactionStatus';
import * as customerDetails from '../domain/customer/customerDetails';
import * as transactionHistory from '../domain/transaction_status/transactionStatusHistory';
import * as customerKyc from '../domain/customer_kyc/customerKyc';
import { UserKYCService } from '../domain/user_kyc';
import { IPLookup } from './../libs/geoip';
import passportDirect from "passport";

import { containerInstance } from './../container';

import { AppV2 } from './AppV2';

const appv2 = containerInstance?.resolve<AppV2>('appV2');
// const xxxx = containerInstance?.resolve<any>('config');
// // console.log(containerInstance.registrations, 'wwwwwwwwwwww');
// console.log(xxxx, 'xxxxxxxx');
const app = appv2.getApp();
// const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('trust proxy', true);

export const appFactory = (Services: any) => {
  const passport: any = Services.libs.passport;
  const getCustomerDetailsCompanyUUID: any = Services.libs.getCustomerDetailsCompanyUUID;
  const userService: UsersService = Services.userService;  
  const merchantService: MerchantService = Services.merchantService;
  const customerAccessAuditService: CustomerAccessAuditService = Services.customerAccessAuditService;
  const adminAccountService: AdminAccountService = Services.adminAccountService;

  const transactionService: TransactionService = Services.transactionService;
  const userKYCService: UserKYCService = Services.userKYCService;

  app.use(passport({ userService, adminAccountService, transactionService }).initialize());
  const user = userRoute(userService);  
  const merchant = merchantRoute(merchantService);
  const transaction = transactionRoute(transactionService, userKYCService, getCustomerDetailsCompanyUUID);
  const paymentRouter = PaymentRouter(transactionService, userKYCService, getCustomerDetailsCompanyUUID);
  

  app.use('/admin/users', user);

  app.use('/auth', authRoute({ customerAccessAuditService }));
  app.use('/user-kyc', userKYCRoute( userKYCService ))
  app.get('/health', (req: Request, res: Response) => {
    console.log(req.ip, 'ippp')
    var source: any = req.headers['user-agent'],
    ua = useragent.parse(source);
    const geoip = IPLookup({ ip: req.ip });
    res.status(200).json({ msg: 'OK', data: (ua), geoip });
  });

  app.use('/payment/auth', transaction);

  app.use('/merchant', merchant);
  
  app.use('/client/payment', paymentRouter);

  app.post('/check-enrolled-status', async (req: Request,res: Response) => {
    try {
        const cardNumber = req.body.cardNumber;
        const enrolledStatus = await transactionService.checkCardEnrolledStatus(cardNumber);
        console.log('enrolledStatus_RESPONSE', enrolledStatus);
        return res.status(200).json({ enrolledStatus });
    } catch (error) {
      return res.status(error.code || 500).json({ code: error.code || 500, message: 'Unable to process request', error: error.error || {}  });
    }
  })

  app.post('/finalize-transaction', async (req: Request,res: Response) => {
    try {
        const { pares = '', md = '' } = req.body;
        const finalizeRes = await transactionService.finalizeTransaction(pares, md);
        console.log('finalizeTransaction_RESPONSE', finalizeRes);
        return res.status(200).json({ code: 200, data: finalizeRes });
    } catch (error) {
        return res.status(error.code || 500).json({ code: error.code || 500, message: 'Unable to process request', error: error.error || {}  });
    }
  })

  app.get('/details/query/:requestUUID',
    passportDirect.authenticate('jwt', { session: false }),
    async (req: Request, res: Response) => {
    const userData: any = req.user;
    // const userData: any = { company_uuid: '1a9335ec-29b4-4a6a-8c00-78a4af23aeea' };
    
    const requestUUID : string = req.params.requestUUID;
    if (requestUUID === '') {
      return res.json({ status: false, message: "RequestUUID Is Required" });
    }
    const transactionData = await transactionService.transactionByRequestUUID(requestUUID);
    if (transactionData && transactionData.adax_uuid === userData.company_uuid) {
      return transactionStatus.getTransactionStatus(requestUUID)
        .then((result) => {
          return res.send(result);
        }).catch((err) => {
          return res.send(err);
        });
    }
    return res.status(404).json({ code: 404, status: false, message: 'Invalid/request uuid not found.' });
  });

  app.post('/transaction-status-history', passportDirect.authenticate('jwt', { session: false }), (req: Request | any, res: Response) => {
    const { page, limit, start_date, end_date, search, order_by, email_id} = req.body;
    const user_id: number = +req.user.user_id;

    console.log( "got details :=>",user_id, page, limit, start_date, end_date, search, order_by, email_id);

    if(!user_id){

      return res.json({ status: false, message: "User id is Required!!" });

    }
    if( ( typeof start_date !== 'undefined') && ( typeof end_date !== 'undefined') ){

      transactionHistory.getTransactionStatusHistory(user_id, page, limit, start_date, end_date, search, order_by, email_id)
      .then((result) => {

          // console.log('get result in transactionStatusHistory :==> ',result);
          return res.send(result);

      }).catch((err) => {

          return res.send(err);

      });

    }else{

      return res.json({ status: false, message: "Date range is Required!!" });

    }
    
  });

  app.post('/get-login-event-logs', passportDirect.authenticate('jwt', { session: false }), (req: Request | any, res: Response) => {

    const { page, limit, search, order_by } = req.body;
    const user_id: number = +req.user.sub_user_id || +req.user.user_id;
    const is_parent_user: boolean = !req.user.sub_user_id;
    if (!user_id) {
      return res.json({ status: false, message: "User id is Required!!" });
    }
    else {
      getloginEvents(user_id, page, limit, search, order_by, is_parent_user).then((result) => {

        // console.log('get result in getTransactionStatus :==> ',result);

        return res.send(result);
      }).catch((err) => {

        console.log('ERROR :', err)
        return res.send(err);

      });

    }

  });

  app.post('/get-call-event-logs', passportDirect.authenticate('jwt', { session: false }), (req: Request | any, res: Response) => {

    const { page, limit, search, order_by } = req.body;
    const user_id: number = +req.user.user_id;

    if (!user_id) {
      return res.json({ status: false, message: "User id is Required!!" });
    }
    else {
      getCallEvents(user_id, page, limit, search, order_by).then((result) => {

        // console.log('get result in getTransactionStatus :==> ',result);

        return res.send(result);
      }).catch((err) => {

        console.log('ERROR :', err)
        return res.send(err);

      });
    }

  });

  app.get('/get-customer-details/:userId', passportDirect.authenticate('jwt', { session: false }), (req: Request, res: Response) => {

    const userId : number | string = req.params.userId;
    // console.log('/get-customer-details/:userId ==>',userId);
    if (userId === '') {
      return res.json({ status: false, message: "userId Is Required" });
    }
    else {
      customerDetails.getCustomerDetails(userId)
      .then((result) => {

        // console.log('get result in getCustomerDetails :==> ',result);
        return res.send(result);

      }).catch((err) => {

        return res.send(err);
        
      });
    }
  });

  app.post('/get-customer-kyc', passportDirect.authenticate('jwt', { session: false }), (req: any, res: Response) => {
    const { page, limit, start_date, end_date, search, order_by} = req.body;
    const user_id: number = +req.user.user_id;

    console.log( "got details :=>",user_id, page, limit, start_date, end_date, search, order_by);

    if(!user_id){

      return res.json({ status: false, message: "User id is Required!!" });

    }
    customerKyc.getCustomerKyc(user_id, page, limit, start_date, end_date, search, order_by)
    .then((result) => {

        // console.log('get result in getCustomerKyc :==> ',result);
        return res.send(result);

    }).catch((err) => {

        return res.send(err);

    });

  });
  
  // app.use(errorHandler);
  return app;
};
