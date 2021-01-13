import express, { Router, Request, NextFunction } from 'express';


import { ITransactionServiceV2 } from '../../../domain/transaction';
import { IUserKYCServiceV2 } from '../../../domain/user_kyc';
import { ICryptoEngineService } from '../../../services';

import { IResponse } from '../';
import { HttpException } from '../errors';

export interface IPaymentRoute {
  routes(): Router
}


export interface IPaymentRouteDeps {
  TransactionServiceV2: ITransactionServiceV2;
  UserKYCServiceV2: IUserKYCServiceV2;
  CryptoEngineService: ICryptoEngineService;
}

export class PaymentRoute
  implements IPaymentRoute {
  private transactionServiceV2: ITransactionServiceV2;
  private UserKYCServiceV2: IUserKYCServiceV2;
  private CryptoEngineService: ICryptoEngineService;

  constructor(deps: IPaymentRouteDeps) {
    this.transactionServiceV2 = deps.TransactionServiceV2;
    this.UserKYCServiceV2 = deps.UserKYCServiceV2;
    this.CryptoEngineService = deps.CryptoEngineService;
  }
  routes(): express.Router {
    const router = express.Router();
    router.post('/auth', async (req: Request, res: IResponse, next: NextFunction) => {
      try {
        const createTransactionRes = await this.transactionServiceV2.createTransaction({
          ...req.body,
        });
        res.userData = createTransactionRes;
        next();
      } catch (error) {
        const httpError = new HttpException(error);
        next(httpError);
      }
    });

    router.post('/auth/kyc-verified', async (req: Request, res: IResponse, next: NextFunction) => {
      try {
        const {
          company_uuid,
          request_uuid,
          amount,
          currency,
          card_number,
          expiry_date,
          cvc2,
          transaction_status,
          auto_clear,
          redirect_url,
          crypto_transfer,
          kyc_delayed,
          wallet,
          address_ip,
          customerInfo: {
            email,
            first_name,
            last_name,
            address1,
            address2,
            CPC,
            ST,
            postalCode,
            country,
          },
        } = req.body;
        const isKYCSaved = await this.UserKYCServiceV2.save({
          email,
          address1,
          address2,
          CPC,
          ST,
          postalCode,
          country,
          firstName: first_name,
          lastName: last_name,
          companyUUID: company_uuid,
        });
        
        if (!isKYCSaved) {
          throw ({ code: 422, message: 'Unable to save customer details'}); 
        }
        if (crypto_transfer) {
          try {
            await this.CryptoEngineService.createQuote({
              requestUUID: String(request_uuid),
              email: String(email),
              amount: Number(amount/100),
              walletAddress: String(wallet),
              companyUUID: String(company_uuid),
            }) 
          } catch (error) {
            throw ({ code: 422, message: 'Unable to save customer details', ...error.response.data.meta }); 
          }
        }

        const createTransactionRes = await this.transactionServiceV2.createTransaction({
          company_uuid,
          request_uuid,
          first_name,
          last_name,
          email,
          address_ip,
          amount,
          currency,
          card_number,
          expiry_date,
          cvc2,
          transaction_status,
          auto_clear,
          redirect_url,
          crypto_transfer,
          kyc_delayed,
          wallet,
          fees: 0,
          event_result: '',
          merchant_uuid: '',
          response_code: '',
        });
        res.userData = createTransactionRes;
        next();
      } catch (error) {
        const httpError = new HttpException(error);
        next(httpError);
      }
    });

    return router;
  }
}