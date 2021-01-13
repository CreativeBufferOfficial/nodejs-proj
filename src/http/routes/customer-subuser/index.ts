import express, { Router, NextFunction } from 'express';


import { IUsersServiceV2 } from '../../../domain/users';

import { IResponse, IRequest } from '..';
import { HttpException } from '../errors';

export interface ICustomerSubUserRoute {
  routes(): Router
}


export interface ICustomerSubUserRouteDeps {
  UsersServiceV2: IUsersServiceV2;
}

export class CustomerSubUserRoute
  implements ICustomerSubUserRoute {
  private usersServiceV2: IUsersServiceV2;
  constructor(deps: ICustomerSubUserRouteDeps) {
    this.usersServiceV2 = deps.UsersServiceV2;
  }

  routes(): express.Router {
    const router = express.Router();
    router.get('/', async (req: IRequest, res: IResponse, next: NextFunction) => {
      try {
        const { perPage, page, search } = req.query
        const subUsers = await this.usersServiceV2.getSubusersByUserId(req.user?.user_id, String(search), Number(page), Number(perPage));
        res.userData = {
          result: subUsers,
        };
        next();
      } catch (error) {
        const httpError = new HttpException(error);
        next(httpError);
      }
    });

    router.delete('/:id', async (req: IRequest, res: IResponse, next: NextFunction) => {
      try {
        const { id } = req.params
        console.log(id, 'idddddddddddd')
        const subUsers = await this.usersServiceV2.deleteSubUser(Number(id), req.user?.user_id);
        res.userData = {
          result: subUsers,
        };
        next();
      } catch (error) {
        const httpError = new HttpException(error);
        next(httpError);
      }
    });
    
    router.post('/', async (req: IRequest, res: IResponse, next: NextFunction) => {
      try {
        const {
          first_name,
          last_name,
          password,
          email,
        } = req.body;
        const subUser = await this.usersServiceV2.createSubUser(
          email,
          password,
          first_name,
          last_name,
          req.user?.user_id,
        );
        res.userData = {
          result: subUser,
        };
        next();
      } catch (error) {
        const httpError = new HttpException(error);
        next(httpError);
      }
    });
    
    
    router.post('/edit/:id', async (req: IRequest, res: IResponse, next: NextFunction) => {
      try {
        const { id } = req.params
        const {
          first_name,
          last_name,
          password,
          email,
        } = req.body;
        const subUsers = await this.usersServiceV2.updateSubUser(
          Number(id),
          first_name,
          last_name,
          req.user?.user_id,
          email,
          password,
        );
        res.userData = {
          result: subUsers,
        };
        next();
      } catch (error) {
        const httpError = new HttpException(error);
        next(httpError);
      }
    });

    return router;
  }
}