import { ICustomerService } from './../customer/Customer.interfaces';
import { IUserKYCRepository } from './IUserKYCRepository';

export interface ISaveKYCData {
  companyUUID: string;
  email: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  CPC: string;
  ST: string;
  postalCode: string;
  country: string;
}

export interface IUserKYCServiceV2 {
  save(data: ISaveKYCData): Promise<boolean>;
}

export interface IUserKYCServiceV2Dependencies {
  CustomerService: ICustomerService;
  UserKYCRepository: IUserKYCRepository;
}