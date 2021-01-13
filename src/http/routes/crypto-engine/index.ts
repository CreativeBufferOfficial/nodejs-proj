import express, { Router, Request, Response, NextFunction } from 'express';


import { ICryptoEngineService } from '../../../services';
import { HttpException } from './../errors';

export interface IResponse extends Response {
  userData?: any
}

export interface ICryptoEngine {
  routes(): Router
}


export interface ICryptoEngineDeps {
  CryptoEngineService: ICryptoEngineService
}

export class CryptoEngine
  implements ICryptoEngine {
  
  CryptoEngineService: ICryptoEngineService;
  constructor(deps: ICryptoEngineDeps) {
    this.CryptoEngineService = deps.CryptoEngineService
  }
  
  routes(): Router {
    const router = express.Router();

    router.get('/pricing', async (req: Request, _res: IResponse, next: NextFunction) => {
      try {
        const { symbol } = req.query;
        const result = await this.CryptoEngineService.getPricing({ symbol: String(symbol) })
        _res.userData = result;
        next();
      } catch (error) {
        const httpError = new HttpException(error);
        next(httpError);
      }
    });

    router.get('/status', async (req: any, res: IResponse, next: NextFunction) => {
      try {
        const result = await this.CryptoEngineService.getStatus({ queryString: req._parsedUrl.query })
        res.userData = result;
        next()
      } catch (error) {
        const httpError = new HttpException(error);
        next(httpError);
      }
    });

    router.post('/quote', async (req: Request, res: IResponse, next: NextFunction) => {
      try {
        const { requestUUID, email, amount, walletAddress, company_uuid } = req.body;
        const result = await this.CryptoEngineService.createQuote({
          requestUUID: String(requestUUID),
          email: String(email),
          amount: Number(amount),
          walletAddress: String(walletAddress),
          companyUUID: String(company_uuid),
        })
        res.userData = result;
        next()
      } catch (error) {
        let httpError = new HttpException(error);
        if (error && error.isAxiosError) {
          httpError = new HttpException(error.response.data.meta);
          next(httpError);
        }
        next(httpError);
      }
    });

    return router;
  }
}
