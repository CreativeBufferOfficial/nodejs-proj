import express, { Response } from 'express';
import { UserKYCService } from '../../../domain/user_kyc'
import passport from 'passport';
import { config } from './../../../configuration';

const router = express.Router();

export function userKYCRoute(userKYCService: UserKYCService) {
  router.post(
    '/search',
    passport.authenticate('jwt', { session: false }),
    async (req: any, res: Response) => {
      try {
        const page: number = +req.body.page || 1;
        const searchQuery: string = <string>req.body.searchQuery || '';
        const perPage: number = +req.body.perPage || 1;
        const userId: number = +req.user.user_id;
        const kycStatus: string = <string>req.body.kycStatus || '';
  
        const userKYCData = await userKYCService.getAllByCustomer({ user_id: userId, searchQuery, kycStatus, page, perPage })
        res.status(200).json({ code: 200, data: userKYCData }); 
      } catch (error) {
        console.error(error)
        res.status(500).json({ code: 500, message: 'Unable to fetch data.' }); 
      }
    })
  
  router.post(
    '/generate-webform',
    passport.authenticate('jwt', { session: false }),
    async (req: any, res: Response) => {
      try {
        const userId: number = +req.user.user_id;
        const { email = '', } = req.body;
        const newKYC = await userKYCService.saveBlockPassKYC(userId, email /*'dd65fa35-b95c-4d4e-a255-843a146d4c20'*/);
        const block_pass_widget: string = `
        <html>
          <head>
            <title>KYC</title>
            <script src= 'https://cdn.blockpass.org/widget/scripts/release/3.0.0/blockpass-kyc-connect.prod.js'></script>
          </head>
          <body>
          <button id="blockpass-kyc-connect">Start KYC Process</button>
          <script>
            (function () {
              document.body.onload = function () {
                const blockpass = new BlockpassKYCConnect('${config.BLOCKPASS_CLIENTID}',
                {
                  env: '${config.BLOCKPASS_ENV}',
                  refId: 'abafdsafsd${newKYC?.refId}'
                });
                blockpass.startKYCConnect();
                const kycBtn = document.getElementById('blockpass-kyc-connect');
                kycBtn.click();
              }
            })()
          </script>  
          </body>
        </html>`;
        res.status(200).json({ code: 200, data: block_pass_widget }); 
      } catch (error) {
        console.error(error, 'USER_KYC_GENERATE_QR_CODE')
        res.status(error.code).json(error); 
      }
    })
  
    // router.get(
    //   '/generate-webform',
    //   async (_req: any, res: Response) => {
    //     try {
    //       const email = 'belgajohnpauldimaano@gmail.com';
    //       const newKYC = await userKYCService.saveBlockPassKYC(1, email);
    //       const block_pass_widget: string = `
    //       <html>
    //         <head>
    //           <title>KYC</title>
    //           <script src= 'https://cdn.blockpass.org/widget/scripts/release/3.0.0/blockpass-kyc-connect.prod.js'></script>
    //         </head>
    //         <body>
    //         <button id="blockpass-kyc-connect">Start KYC Process</button>
    //         <script>
    //           (function () {
    //             document.body.onload = function () {
    //               const blockpass = new BlockpassKYCConnect('${config.BLOCKPASS_CLIENTID}',
    //               {
    //                 env: '${config.BLOCKPASS_ENV}',
    //                 refId: 'abafdsafsd${newKYC?.refId}'
    //               });
    //               blockpass.startKYCConnect();
    //               const kycBtn = document.getElementById('blockpass-kyc-connect');
    //               kycBtn.click();
    //             }
    //           })()
    //         </script>  
    //         </body>
    //       </html>`;
    //       res.status(200).json({ code: 200, data: block_pass_widget }); 
    //     } catch (error) {
    //       console.error(error, 'USER_KYC_GENERATE_QR_CODE')
    //       res.status(error.code).json(error); 
    //     }
    // })

  router.get(
    '/check-status/:email',
    passport.authenticate('jwt', { session: false }),
    async (req: any, res: Response) => {
      try {
        const userId: number = +req.user.user_id;
        const { email = '' } = req.params;
        const status = await userKYCService.userBlockpassKYCStatus(userId, email);
        res.status(200).json({ code: 200, data: { status, email } }); 
      } catch (error) {
        console.error(error, 'USER_KYC_CHECK_KYC_STATUS')
        res.status(error.code || 500).json(error); 
      }
    })

  router.post(
    '/blockpass-kyc-webhook',
    async (req: any, res: Response) => {
      try {
        // if (!req.headers.authorization) {
        //   throw({ code: 401, message: 'Required api key' });
        // }
        // if (req.headers.authorization !== config.BLOCKPASS_WEBHOOK_APIKEY) {
        //   throw({ code: 401, message: 'Invalid api key' });
        // }
        console.log(req.body, 'USER_KYC_WEBHOOK_REQUEST_BODY');
        
        res.status(200).json({ code: 200, data: null }); 
      } catch (error) {
        console.error(error, 'USER_KYC_WEBHOOK_ERROR')
        res.status(error.code || 500).json(error); 
      }
    })
  
    router.post(
      '/searchv2',
      passport.authenticate('jwt', { session: false }),
      async (req: any, res: Response) => {
        try {
          const page: number = +req.body.page || 1;
          const searchQuery: string = <string>req.body.searchQuery || '';
          const perPage: number = +req.body.perPage || 1;
          const userId: number = +req.user.user_id;
          const kycStatus: string = <string>req.body.kycStatus || '';
    
          const userKYCData = await userKYCService.getAllBlockPassByCustomer(userId, searchQuery, kycStatus, page, perPage)
          res.status(200).json({ code: 200, data: userKYCData }); 
        } catch (error) {
          console.error(error)
          res.status(500).json({ code: 500, message: 'Unable to fetch data.' }); 
        }
      })
    
  return router;
}