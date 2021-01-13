import express, { Request, Response, NextFunction } from 'express';
import { ITransactionServiceV2 } from '../../../domain/transaction';
import { IBlockCardService } from './../../../domain/block-cards';
import { IRiskControlService } from './../../../domain/risk-control';

import { HttpException } from './../errors';

export interface RiskControlRoutesDependencies {
  TransactionServiceV2: ITransactionServiceV2
  BlockCardService: IBlockCardService
  RiskControlService: IRiskControlService
}

export function riskControlRoutes(deps: RiskControlRoutesDependencies) {
  const router = express.Router();

  const TransactionServiceV2 = deps.TransactionServiceV2;
  const BlockCardService = deps.BlockCardService;
  const RiskControlService = deps.RiskControlService;


  router.get('/volume-failed-transaction-logs', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const searchQuery = req.query.searchQuery as string;
      const orderByField = req.query.orderByField as string;
      const orderSort = req.query.orderSort as string;
      const page = +(req.query.page as string) || 1;
      const limit = +(req.query.limit as string) || 3;
      const data = await TransactionServiceV2.getVolumeFailedTransactionLogs({
        searchQuery,
        orderByField,
        orderSort,
        page,
        limit,
      });
      res.json({ result: { ...data }, code: 200, statusCode: 'OK' });
    } catch (error) {
      const httpError = new HttpException(error);
      next(httpError);
    }
  });

  router.get('/card-failed-attempt-transaction-logs', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const searchQuery = req.query.searchQuery as string;
      const companyUUID = req.query.companyUUID as string;
      const orderByField = req.query.orderByField as string;
      const orderSort = req.query.orderSort as string;
      const page = +(req.query.page as string) || 1;
      const limit = +(req.query.limit as string) || 3;
      const data = await BlockCardService.searchBlockedCards({
        searchQuery,
        companyUUID,
        orderByField,
        orderSort,
        page,
        limit,
      });
      res.json({ result: { ...data }, code: 200, statusCode: 'OK' });
    } catch (error) {
      const httpError = new HttpException(error);
      next(httpError);
    }
  });

  router.post('/update-blocked-card', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = +(req.body.id as string);
      const enrolled_status = req.body.enrolled_status as "B" | "Y" | "N" | null;
      const is_read = +(req.body.is_read as string);
      const data = await BlockCardService.updateBlockedCard({
        id,
        enrolled_status,
        is_read,
      });
      res.json({ result: { ...data }, code: 200, statusCode: 'OK' });
    } catch (error) {
      const httpError = new HttpException(error);
      next(httpError);
    }
  });
  
  router.get('/config', async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const riskControlEnabled = await RiskControlService.getRiskControlConfig();
      res.json({
        result: {
          ...riskControlEnabled
        },
        code: 200,
        statusCode: 'OK',
      });
    } catch (error) {
      const httpError = new HttpException(error);
      next(httpError);
    }
  });

  router.post('/toggle', async (req: Request, res: Response, next: NextFunction) => {
    const { enabled }: { enabled: boolean } = req.body;
    const riskControlEnabled = await RiskControlService.toggleRiskControl({ enabled });
    try {
      res.json({
        result: {
          ...riskControlEnabled,
        },
        code: 200,
        statusCode: 'OK',
      });
    } catch (error) {
      const httpError = new HttpException(error);
      next(httpError);
    }
  });

  return router;
}