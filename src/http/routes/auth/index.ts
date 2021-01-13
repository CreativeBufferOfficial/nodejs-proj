import express, { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { IVerifyOptions } from 'passport-local';
import useragent from 'express-useragent';
import { IPLookup } from './../../../libs/geoip';
import { logger } from './../../../libs/logger';
import { ICustomerAccessAuditRepository } from './../../../domain/customer_access_audit/ICustomerAccessAuditRepository';

const router = express.Router();

export function authRoute(services: any) {
  router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      'local',
      { session: false },
      async (err: Error, user: any, info: IVerifyOptions) => {
        if (err) {
          logger.error(err)
          return res.status(500).json(err);
        }

        if (info) {
          logger.info(info)
          return res.status(403).json({ code: 403, ...info });
        }

        var sourceUserAgent: any = req.headers['user-agent'];
        const ipAddress = req.ip; // 112.205.218.251
        const { browser, version, os, platform, source } = useragent.parse(sourceUserAgent);
        const geoip: any = IPLookup({ ip: ipAddress });
        // const geoip = IPLookup({ ip: req.ip });
        let customerLocation: any = "{}"
        if (geoip) {
          customerLocation = JSON.stringify(geoip);
        }

        const customerMachine = JSON.stringify({
          browser,
          version,
          os,
          platform,
          source,
        });
        const dataParams = { customerLocation, userId: user.user_id, ipAddress, customerMachine, isParentUser: user.is_parent_user }
        
        logger.info({data: `'DATA PARAMS SAVE TO CUSTOMER ACCESS AUDIT TABLE' ==> ${dataParams}`})

        await (<ICustomerAccessAuditRepository>services.customerAccessAuditService).logUserAccess(dataParams);

        return res.json(user);
      },
    )(req, res, next);
  });

  router.post('/admin-login', async (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      'admin-login',
      { session: false },
      async (err: Error, user: any, info: IVerifyOptions) => {
        if (err) {
          logger.error(err)
          return res.status(500).json(err);
        }

        if (info) {
          logger.info(info)
          return res.status(403).json({ code: 403, ...info });
        }

        // var sourceUserAgent: any = req.headers['user-agent'];
        // const ipAddress = req.ip; // 112.205.218.251
        // const { browser, version, os, platform, source } = useragent.parse(sourceUserAgent);
        // const geoip: any = IPLookup({ ip: ipAddress });
        // // const geoip = IPLookup({ ip: req.ip });
        // let customerLocation: any = "{}"
        // if (geoip) {
        //   customerLocation = JSON.stringify(geoip);
        // }

        // const customerMachine = JSON.stringify({
        //   browser,
        //   version,
        //   os,
        //   platform,
        //   source,
        // });
        // const dataParams = { customerLocation, userId: user.userId, ipAddress, customerMachine }
        // logger.info(dataParams)
        // await (<ICustomerAccessAuditRepository>services.customerAccessAuditService).logUserAccess(dataParams);

        return res.status(200).json(user);
      },
    )(req, res, next);
  });

  router.post('/jwt-validator',
    passport.authenticate('jwt', { session: false }),
    async (req: any, res: Response, _next: NextFunction) => {
      console.log(req.user, 'uuuserdddd')
      return res.status(200).json({ validation: 'OK' })
    }
  );

  return router;
}
