import express, { Request, Response } from 'express';
import { UsersService } from '../../../domain/users/usersService';
import passport from 'passport';

const router = express.Router();

export function userRoute(userService: UsersService) {
  router.post(
    '/',
    passport.authenticate('admin', { session: false }),
    async (req: Request, res: Response) => {
      try {
        const { user_status } = req.body;
        const users = await userService.getAllUsers(user_status);
        res.status(200).json({ code: 200, message: '', data: users }); 
      } catch (error) {
        res.status(500).json({ code: 500, message: 'Unable to fetch data.' }); 
      }
    },
  );
  router.post(
    '/create',
    passport.authenticate('admin', { session: false }),
    async (req: Request, res: Response) => {
      try {
        const { 
          email,
          password,
          term_url,
          company_name,
          contact_person,
          address,
          contact_vat_tax_id,
          currency,
          ip_address,
          amount_threshold,
          is_kyc_active,
          fees,
          callback_url,
          webhook_endpoint,
        }  = req.body;
        const user = await userService.createUser(
          email,
          password,
          term_url,
          company_name,
          contact_person,
          address,
          contact_vat_tax_id,
          currency,
          ip_address,
          +amount_threshold,
          is_kyc_active,
          +fees,
          callback_url,
          webhook_endpoint,
        );
        res.status(200).json({ code: 200, message: '', data: user }); 
      } catch (error) {
        console.log(error, 'errorerror')
        res.status(error.code).json({ ...error }); 
      }
    },
  );

  router.post(
    '/edit',
    passport.authenticate('admin', { session: false }),
    async (req: Request, res: Response) => {
      try {
        const { 
          user_id,
          term_url,
          company_name,
          contact_person,
          address,
          contact_vat_tax_id,
          currency,
          ip_address,
          amount_threshold,
          is_kyc_active,
          fees,
          callback_url,
          webhook_endpoint,
        }  = req.body;
        console.log(fees, 'ffff')
        const user = await userService.editUser(
          user_id,
          term_url,
          company_name,
          contact_person,
          address,
          contact_vat_tax_id,
          currency,
          ip_address,
          +amount_threshold,
          is_kyc_active,
          +fees,
          callback_url || '',
          webhook_endpoint || '',
        );
        res.status(200).json({ code: 200, message: '', data: user }); 
      } catch (error) {
        console.log(error, 'errorerror')
        res.status(error.code).json({ ...error }); 
      }
    },
  );
  
  router.post(
    '/change-status',
    passport.authenticate('admin', { session: false }),
    async (req: Request, res: Response) => {
      try {
        const { user_id, status }  = req.body;
        const user = await userService.changeStatus(
          user_id,
          status,
        );
        res.status(200).json({ code: 200, message: '', data: user }); 
      } catch (error) {
        console.log(error, 'errorerror')
        res.status(error.code).json({ ...error }); 
      }
    },
  );

  router.post(
    '/sub-user/create',
    passport.authenticate('admin', { session: false }),
    async (req: Request, res: Response) => {
      try {
        const {
          email = '',
          password = '',
          first_name = '',
          last_name = '',
          parent_user_id = null } = req.body;
        const subUser = await userService.createSubUser(
          email,
          password,
          first_name,
          last_name,
          parent_user_id
        );
        res.status(200).json({ code: 200, message: '', data: subUser }); 
      } catch (error) {
        res.status(error.code).json({ ...error }); 
      }
    },
  );

  router.post(
    '/sub-user/update',
    passport.authenticate('admin', { session: false }),
    async (req: Request, res: Response) => {
      try {
        const {
          id = null,
          password = '',
          first_name = '',
          last_name = '',
          parent_user_id = null } = req.body;

        const subUser = await userService.updateSubUser(
          id,
          first_name,
          last_name,
          parent_user_id,
          password
        );
        res.status(200).json({ code: 200, message: '', data: subUser }); 
      } catch (error) {
        res.status(error.code).json({ ...error }); 
      }
    },
  );

  router.post(
    '/sub-user/delete',
    passport.authenticate('admin', { session: false }),
    async (req: Request, res: Response) => {
      try {
        const { id = null, parent_user_id = null } = req.body;

        const subUser = await userService.deleteSubUser(
          id,
          parent_user_id
        );
        res.status(200).json({ code: 200, message: '', data: subUser }); 
      } catch (error) {
        res.status(error.code).json({ ...error }); 
      }
    },
  );

  router.get(
    '/sub-user/:parent_user_id',
    passport.authenticate('admin', { session: false }),
    async (req: Request, res: Response) => {
      try {

        const parent_user_id: number = <number>(+req.params.parent_user_id)
        const subUsers = await userService.getSubusersByUserId(parent_user_id);
        res.status(200).json({ code: 200, message: '', data: subUsers }); 
      } catch (error) {
        res.status(error.code).json({ ...error }); 
      }
    },
  );
  
  return router;
}
