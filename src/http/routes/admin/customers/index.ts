import express, { Request, Response, NextFunction } from 'express';

import { ICustomerService } from './../../../../domain/customer';

import { HttpException } from './../../errors';

export interface Dependencies {
  CustomerService: ICustomerService,
}

export function customerAdminRoutes(deps: Dependencies) {
  const router = express.Router();

  const CustomerService = deps.CustomerService;

  router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await CustomerService.getCustomers()
      res.json({ result: { ...data }, code: 200, statusCode: 'OK' });
    } catch (error) {
      const httpError = new HttpException(error);
      next(httpError);
    }
  });
  return router;
}