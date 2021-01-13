import bcrypt from 'bcryptjs';
import Joi from '@hapi/joi'
import { IMerchantRepository } from './IMerchantRepository';
import MerchantRequests from '../../data/database/models/MerchantRequests';
import { emailMerchantConfirmation } from '../../functions/email-merchant-confirmation';

export class MerchantRepository implements IMerchantRepository {
    async add(
        first_name: string,
        last_name: string,
        company: string,
        email: string,
      ): Promise<any>{


        const schema = Joi.object({
            first_name: Joi.string().required(),
            last_name: Joi.string().required(),
            company: Joi.string().required(),
            email: Joi.string().required(),
        });

        const { error } = schema.validate({
            first_name,
            last_name,
            company,
            email,
        }, { abortEarly: false });

        if (error) {
            const errorMsg =  error.details.map((e: any) => {
                return {
                    key : e.context.key,
                    msg: e.message
                };
            }).reduce((acc: any, curr: any) => {
                acc[curr.key] = curr.msg;
                return acc;
            }, {});
            throw({ code: 422, message: errorMsg[Object.keys(errorMsg)[0]], error_messages: errorMsg });
        }


        const newMerchant = new MerchantRequests({
            first_name,
            last_name,
            company,
            email,
        });
        
        const salt = bcrypt.genSaltSync(10);
        const hash_email = bcrypt.hashSync(email, salt);
        console.log(encodeURIComponent(hash_email))
        await emailMerchantConfirmation(email,{hash_email});
        return await newMerchant.save();
      }

      async emailExists( email: string ): Promise<boolean> {

        const schema = Joi.object({
            email: Joi.string().required(),
        });

        const { error } = schema.validate({
            email,
        }, { abortEarly: false });

        if (error) {
            const errorMsg =  error.details.map((e: any) => {
                return {
                    key : e.context.key,
                    msg: e.message
                };
            }).reduce((acc: any, curr: any) => {
                acc[curr.key] = curr.msg;
                return acc;
            }, {});
            throw({ code: 422, message: errorMsg[Object.keys(errorMsg)[0]], error_messages: errorMsg });
        }

        const merchatData = await MerchantRequests.findAll({ where: { email: email, merchantApproved:true } });
        return merchatData.length>0 ? true : false
      }


      async hashMatch( id:string,hash:string ):Promise<boolean>{
        const schema = Joi.object({
          id: Joi.string().required(),
          hash: Joi.string().required(),
        });

        const { error } = schema.validate({
            id,
            hash,
        }, { abortEarly: false });

        if (error) {
            const errorMsg =  error.details.map((e: any) => {
                return {
                    key : e.context.key,
                    msg: e.message
                };
            }).reduce((acc: any, curr: any) => {
                acc[curr.key] = curr.msg;
                return acc;
            }, {});
            throw({ code: 422, message: errorMsg[Object.keys(errorMsg)[0]], error_messages: errorMsg });
        }

        const merchantData: any  = await MerchantRequests.findOne({ where: { id } });
        const match =  bcrypt.compareSync(merchantData.email, hash)
        if(match){
          await MerchantRequests.update(
            {merchantApproved: true},
            {where: {id}},
          )
        }
        return match
      }
}