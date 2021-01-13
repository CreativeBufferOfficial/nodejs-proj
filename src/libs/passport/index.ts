import passport from 'passport';
import bcrypt from 'bcryptjs';
import passportLocal from 'passport-local';
import jwt from 'jsonwebtoken';
import passportJWT from 'passport-jwt';

import User from './../../data/database/models/Users';
import SubUser from './../../data/database/models/SubUsers';
import { IUserRepository } from './../../domain/users/IUserRepository';

import AdminAccount from './../../data/database/models/AdminAccount';
import { IAdminAccountRepository } from './../../domain/admin_account/IAdminAccountRepository';

const JWTStrategy: any = passportJWT.Strategy;
const ExtractJWT: any = passportJWT.ExtractJwt;
const LocalStrategy: any = passportLocal.Strategy;

/**
 * Sign in using Email and Password.
 */
export default (services: any) => {
  passport.use(
    new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true
    }, async (_req: any, email: string, password: string, done: any) => {
      try {
        let userInstance: User | SubUser | null  = null;
        let parentUserId: number | null = null;
        let subUserId: number | null = null;
        userInstance = await (<IUserRepository>services.userService).getUserByEmail({ email: email }) as User;
        if (!userInstance) {
          userInstance = await (<IUserRepository>services.userService).getSubUserByEmail(email) as SubUser;
          if (!userInstance) {
            return done(undefined, false, {
              code: 101,
              message: `Invalid username or password.`,
            });
          }
          console.log(JSON.parse(JSON.stringify(userInstance)), 'userInstanceuserInstance');
          if (userInstance.is_active !== 1 || userInstance.customer_details.is_active !== 1) {
            return done(undefined, false, {
              code: 101,
              message: `Your Merchant Account Inactive.`,
            });
          }
          parentUserId = userInstance.parent_user_id;
          subUserId = userInstance.id;
        } else {
          console.log(JSON.parse(JSON.stringify(userInstance)), 'userInstanceuserInstance');
          if (userInstance.is_active !== 1 || userInstance.customer_details.is_active !== 1) {
            return done(undefined, false, {
              code: 101,
              message: `Merchant Account is Inactive.`,
            });
          }
          parentUserId = userInstance.id;
        }

        const comparePassword = await bcrypt.compare(
          password,
          userInstance.password,
        );

        if (!comparePassword) {
          return done(undefined, false, {
            code: 102,
            message: `Invalid username or password.`,
          });
        }

        const jwtToken = jwt.sign(
          {
            user_id: parentUserId,
            email: userInstance.email,
            company_uuid: userInstance.customer_details.company_uuid,
            role: 2,
            ...( subUserId && { sub_user_id: subUserId, }),
          },
          process.env.PW_ENCRYPTION_KEY as string,
          { expiresIn: '5d' }
        );

        return done(undefined, {
          authenticated: true,
          user_id: userInstance.id,
          ...( subUserId && { is_parent_user: !subUserId, }),
          token: jwtToken,
          code: 200,
          message: `Successfully loggedin`,
        });
      } catch (error) {
        console.log(error, 'errr')
        return done(undefined, false, {
          code: 100,
          message: `Invalid username or password.`,
        });
      }
    }),
  );

  passport.use('admin-login',
    new LocalStrategy({
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback: true
    }, async (_req: any, username: string, password: string, done: any) => {
      try {
        const userInstance: AdminAccount | null  = await (<IAdminAccountRepository>services.adminAccountService).getAdminAccountByEmail({ username });
        
        if (!userInstance) {
          return done(undefined, false, {
            code: 101,
            message: `Invalid username or password.`,
          });
        }
        const comparePassword = await bcrypt.compare(
          password,
          userInstance.password,
        );

        if (!comparePassword) {
          return done(undefined, false, {
            code: 102,
            message: `Invalid username or password.`,
          });
        }

        const jwtToken = jwt.sign(
          {
            user_id: userInstance.id,
            email: userInstance.username,
            role: 1,
          },
          process.env.PW_ENCRYPTION_KEY as string,
          { expiresIn: '24h' }
        );

        return done(undefined, {
          authenticated: true,
          user_id: userInstance.id,
          token: jwtToken,
          code: 200,
          message: `Successfully loggedin`,
        });
      } catch (error) {
        console.log(error, 'errr')
        return done(undefined, false, {
          code: 100,
          message: `Invalid username or password.`,
        });
      }
    }),
  )

  passport.use(
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.PW_ENCRYPTION_KEY as string,
      },
      async (jwtPayload: any, cb: any) => {
        console.log(jwtPayload, 'jwtPayload');

        let userInstance: User | SubUser | null  = null;

        if (jwtPayload.hasOwnProperty('user_id') || jwtPayload.hasOwnProperty('sub_user_id')) {
          
          if (jwtPayload.hasOwnProperty('sub_user_id')) {
            userInstance = await (<IUserRepository>services.userService).getSubuserById(jwtPayload.sub_user_id) as SubUser;
            if (userInstance && (userInstance.is_active !== 1 || userInstance.customer_details.is_active !== 1)) {
              return cb({
                code: 401,
                message: `Inactive user`
              })
            }
          } else { // check for parent user
            userInstance = await (<IUserRepository>services.userService).getUserById({ user_id: jwtPayload.user_id }) as User;
            if (userInstance && userInstance.is_active !== 1) {
              return cb({
                code: 401,
                message: `Inactive user`
              })
            }
          }

          if (!userInstance) {
            return cb({
              code: 401,
              message: `User not found`
            })
          }
          return cb(null, { 
            ...jwtPayload,
          });
        } else {
          return cb({
            code: 401,
            message: `Invalid token`
          })
        }
      },
    ),
  );

  passport.use(
    'admin',
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.PW_ENCRYPTION_KEY as string,
      },
      async (jwtPayload: any, cb: any) => {
        console.log(jwtPayload, 'jwtPayloadjwtPayload');
        if (jwtPayload.hasOwnProperty('user_id')) {
          const userInstance: AdminAccount | null  = await (<IAdminAccountRepository>services.adminAccountService).getAdminAccountById({ user_id: jwtPayload.user_id });
          if (!userInstance) {
            return cb({
              code: 401,
              message: `User not found`
            })
          }
          return cb(null, { ...jwtPayload });
        } else {
          return cb({
            code: 401,
            message: `Invalid token`
          })
        }
      },
    ),
  );

  return passport;
}