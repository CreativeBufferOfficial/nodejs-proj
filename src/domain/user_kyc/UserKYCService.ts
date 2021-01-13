import UserKYC from './../../data/database/models/UserKYC';
import BlockPassCustomerClientKYC from './../../data/database/models/BlockPassCustomerClientKYC';
import IUserKYCRepository, { IUserKYCData } from './IUserKYCRepository';
import CustomerDetails from './../../data/database/models/CustomerDetails';
import { checkBlockPassKYCStatus } from './../../libs/blockpass';
import Joi from '@hapi/joi';
import UUIDv4 from 'uuid/v4';

export class UserKYCService {
  constructor(private readonly UserKYCRepository: IUserKYCRepository) { }

  async getAllUserKYC(): Promise<UserKYC[] | null> {
    return await this.UserKYCRepository.getAll();
  }

  async getUserKYCByEmail(email: string): Promise<UserKYC | null> {
    if (!email) return null;
    return await this.UserKYCRepository.getByEmail(email);
  }

  async getAllByCustomer({ user_id, searchQuery, kycStatus, page, perPage }: { user_id: number, searchQuery: string, kycStatus: string, page: number, perPage: number }): Promise<{ records: IUserKYCData[] | null, numOfPages: number, totalRecordCount: number, perPage: number }> {
    return await this.UserKYCRepository.getAllByCustomer({ user_id, searchQuery, kycStatus, page, perPage });
  }

  async saveBlockPassKYC(userId: number, email: string): Promise<BlockPassCustomerClientKYC| null> {
    const refId = UUIDv4();
    const schema = Joi.object({
      email: Joi.string().email().required(),
      userId: Joi.number().required(),
      refId: Joi.string().uuid().required(),
    });

    const { error } = schema.validate({ 
      email,
      userId,
      refId,
      }, { abortEarly: false });
    if (error) {
      const errorMsg =  error.details.map((e: any) => {
        return {
          key : e.context.key,
          msg: e.message
        };
      }).reduce((acc, curr) => {
        return {
          ...acc,
          [curr.key]: curr.msg
        };
      }, {});
      throw({ code: 422, message: 'Data validation error', error_messages: errorMsg });
    }

    const checkCustomer = await CustomerDetails.findOne({ where: { user_id: userId } });
    if (!checkCustomer) {
      throw({ code: 402, message: 'Company not found.', error_messages: []});
    }
    const checkClientExistence = await this.UserKYCRepository.getBlockPassKYC({ user_id: userId, email });
    if (checkClientExistence && checkClientExistence.status !== "approved") {
      return checkClientExistence;
    } else if (checkClientExistence && checkClientExistence.status === "approved") {
      throw({ code: 422, message: 'Client already KYC already exists and approved.', error_messages: []});
    }

    return await this.UserKYCRepository.saveBlockPassKYC(userId, email, refId);
  }

  async userBlockpassKYCStatus (userId: number, email: string): Promise<string> {
    const checkCustomer = await this.UserKYCRepository.getBlockPassKYCByEmailCustomer(userId, email);
    if (!checkCustomer) {
      throw({ code: 404, message: 'Data not found.' });
    }
    try {
      const userKYCBlockPassStatusData = await checkBlockPassKYCStatus(checkCustomer.refId);
      return userKYCBlockPassStatusData.data.data.status.toLowerCase();
    } catch (error) {
      console.log(error, 'checkBlockPassKYCStatus');
      throw({ code: 404, message: 'Data not found in KYC server.' });
    }
  }

  async userBlockpassKYCWebHook (data: any): Promise<void> {
    console.log('-----------START OF WEBHOOK-----------');
    console.log(data, 'DATA WEBHOOK');
    console.log('-----------END OF WEWHOOK-----------');
  }


  async getAllBlockPassByCustomer(userId: number, searchQuery: string, kycStatus: string, page: number, perPage: number): Promise<{ records: BlockPassCustomerClientKYC[] | null, numOfPages: number, totalRecordCount: number, perPage: number }> {
    return await this.UserKYCRepository.getAllBlockPassByCustomer(userId, searchQuery, kycStatus, page, perPage );
  }
}

export default UserKYCService;