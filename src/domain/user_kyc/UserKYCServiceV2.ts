import UserKYC from '../../data/database/models/UserKYC';
import { ICustomerService } from './../customer/Customer.interfaces';
import IUserKYCRepository, { IUserKYCData } from './IUserKYCRepository';
import { errorValidation } from '../../utils';
import Joi from '@hapi/joi';
import UUIDv4 from 'uuid/v4';

import {
  IUserKYCServiceV2,
  ISaveKYCData,
  IUserKYCServiceV2Dependencies
} from './UserKYC.inteface';

export class UserKYCServiceV2 implements IUserKYCServiceV2 {
  private UserKYCRepository: IUserKYCRepository;
  private CustomerService: ICustomerService;
  constructor(deps: IUserKYCServiceV2Dependencies) {
    this.UserKYCRepository = deps.UserKYCRepository;
    this.CustomerService = deps.CustomerService;
  }

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
  
  async save(data: ISaveKYCData): Promise<boolean> {
    const schema = Joi.object({
      companyUUID: Joi.string().required(),
      email: Joi.string().email().required(),
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      address1: Joi.string().required(),
      address2: Joi.optional(),
      CPC: Joi.string().required(),
      ST: Joi.string().required(),
      postalCode: Joi.string().required(),
      country: Joi.string().required(),
    })
    errorValidation(data, schema)
    
    const emailExists = await this.UserKYCRepository.getByEmail(data.email);
    
    if (emailExists && emailExists.company_uuid === data.companyUUID) {
      return true
    }
    
    const address = `${data.address1}, ${data.address2 ? `${data.address2},` : ''} ${data.CPC}, ${data.ST}, ${data.postalCode}, ${data.country}`;
    const customerID = UUIDv4();
    const customerDetails = await this.CustomerService.getCustomer({ companyUUID: data.companyUUID });

    if (!customerDetails) {
      throw ({ code: 422, message: 'Company doesn\'t exists'}); 
    }

    const savedData = await this.UserKYCRepository.saveData({
      address,
      company_uuid: data.companyUUID,
      customer_id: customerID,
      email: data.email,
      first_name: data.firstName,
      last_name: data.lastName,
      status: 'verified-status',
      user_id: customerDetails.user_id
    });
    if (savedData) {
      return true;
    }
    return false;
  }
}

export default UserKYCServiceV2;