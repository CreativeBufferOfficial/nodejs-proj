import express, { Request, Response } from 'express';
import { MerchantService } from '../../../domain/merchant/merchantService';

const router = express.Router();

export function merchantRoute(merchantService: MerchantService) {

    router.post('/signup', async (req: Request, res: Response) => {
        try {
            const {first_name, last_name, company, email} = req.body;

            const checkEmail = await merchantService.getEmailExists(
                                    email
                                )   
            if(!checkEmail){
                await merchantService.createMerchant(
                    first_name,
                    last_name,
                    company,
                    email   
                );
                return res.status(200).json({success: true,message:'Email sent to your given email'}) 
            } else {
                throw({ code: 422, message: 'Already a merchant', error_messages: {} });
            }
        } catch (error) {
            console.log(error, 'errorerror')
            res.status(error.code).json({ ...error }); 
        }
    })

    router.get('/confirmation/:hash/:id', async (req: Request, res: Response) => {
        const { id, hash } = req.params
        const matchResult= await merchantService.matchHashMerchant(id,decodeURIComponent(hash))
        return res.status(200).json({success: matchResult}) 
    }) 
    
    return router;
}