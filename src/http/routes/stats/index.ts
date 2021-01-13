import express, { Router, Response, NextFunction } from 'express';
import { Sequelize } from 'sequelize-typescript';
import moment from 'moment';
import { Database } from './../../../data/database';

import { HttpException } from './../errors';
export interface IResponse extends Response {
  userData?: any
}


export interface StatsDeps {
  db: Database
  db2: Sequelize
}

export interface IStatsRoutes {
  routes(): Router
}

export class StatsRoutes
  implements IStatsRoutes {
  db: Database;
  db2: Sequelize;
  constructor(deps: StatsDeps) {
    this.db = deps.db
    this.db2 = deps.db2
  }

  routes(): Router {
    const router = express.Router();

    router.get('/', async (req: any, res: IResponse, next: NextFunction) => {
      try {
        const userId: number = +req.user.user_id;
        const companyUUID: string = req.user.company_uuid;
        const approvedTX = await this.db2.query(`
        select
          count(*) as count,
          cast(createdAt as DATE) as transactionDate
        from
          transaction t
        where
          (lower(t.transaction_status) = 'approved'
          OR lower(t.transaction_status) = 'cleared')
          AND t.createdAt BETWEEN DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), "%Y-%m-%d 00:00:00")
          AND DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 DAY), "%Y-%m-%d 23:59:59")
          AND (select customer_details_id  from customer_details where user_id = ${userId})
        group by
          cast(createdAt as DATE)
        `)
        const transferredTX = await this.db2.query(`
        select
          count(*) as count,
          cast(createdAt as DATE) as transactionDate
        from
          transaction t
        where
          (lower(t.transaction_status) = 'approved'
          OR lower(t.transaction_status) = 'cleared')
          AND t.createdAt BETWEEN DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), "%Y-%m-%d 00:00:00")
          AND DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 DAY), "%Y-%m-%d 23:59:59")
          AND crypto_settled = 1
          AND (select customer_details_id  from customer_details where user_id = ${userId})
        group by
          cast(createdAt as DATE)
        `)
        const startDate = moment().subtract(moment().day(), 'days');
        const endDate = moment().add(6, 'days');

        const cardStats = await this.db2.query(`
          SELECT IFNULL((SELECT SUM(t.fees) from transaction t WHERE (lower(t.transaction_status) = 'approved' OR lower(t.transaction_status) = 'cleared')
          AND t.createdAt BETWEEN DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 2 MONTH), "%Y-%m-%d 00:00:00")
          AND DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 DAY), "%Y-%m-%d 23:59:59")
          AND t.adax_uuid = "${companyUUID}" limit 1), 0) as totalFeesEarned,
          
          IFNULL((SELECT SUM(t.amount/100) from transaction t WHERE (lower(t.transaction_status) = 'approved' OR lower(t.transaction_status) = 'cleared')
          AND crypto_settled = 1 AND t.createdAt BETWEEN DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 2 MONTH), "%Y-%m-%d 00:00:00")
          AND DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 DAY), "%Y-%m-%d 23:59:59")
          AND t.adax_uuid = "${companyUUID}"  AND t.crypto_settled = 1 limit 1), 0) as totalTransferred,
      
          IFNULL(
            IFNULL((SELECT balance FROM merchant_wallet_account mwa WHERE customer_details_id = (SELECT id FROM customer_details cd WHERE cd.company_uuid = "${companyUUID}")), 0)
            -
            IFNULL((SELECT SUM(t.amount/100) FROM transaction t WHERE (lower(t.transaction_status) = 'approved' OR lower(t.transaction_status) = 'cleared')
            AND crypto_settled = 1
            AND t.createdAt BETWEEN DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 2 MONTH), "%Y-%m-%d 00:00:00")
            AND DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 DAY), "%Y-%m-%d 23:59:59")
            AND t.adax_uuid = "2f64e543-xxxx-41d1-8f9e-999f1770a8c3"  AND t.crypto_settled = 1 limit 1), 0)
          , 0) as totalRemainingWalletBalance,
          
          IFNULL((SELECT balance FROM merchant_wallet_account mwa WHERE customer_details_id = (SELECT id FROM customer_details cd WHERE cd.company_uuid = "${companyUUID}")), 0) as totalBalance;
        `)
        const cardData = cardStats.length ? cardStats[0][0] : {}
        console.log('-------------------')
        console.log(`AND t.createdAt BETWEEN DATE_FORMAT(${startDate.format('YYYY-MM-DD')}, "%Y-%m-%d 00:00:00") and DATE_FORMAT(${endDate.format('YYYY-MM-DD')}, "%Y-%m-%d 23:59:59")`)
        res.status(200).json({
          approvedTX: approvedTX.length ? approvedTX[0] : [],
          transferredTX: transferredTX.length ? transferredTX[0] : [],
          totalBalance: 0,
          totalRemainingWalletBalance: 0,
          ...cardData as object
          // ...(cardStats.length ? { cardStats[0][0] } : {}),
        })
        // _res.userData = result;
        // next();
      } catch (error) {
        const httpError = new HttpException(error);
        next(httpError);
      }
    });

    return router;
  }
}
