import User from '../../data/database/models/Users';
import SubUser from '../../data/database/models/SubUsers';
import bcrypt from 'bcryptjs';
import Joi from '@hapi/joi';
import { IUserRepository } from './IUserRepository';

import { errorValidation } from '../../utils';

import {
  SubUserResponse,
  IGetSubusersByUserIdResponse,
  UsersServiceDeps,
} from './usersServiceV2.interfaces';
export class UsersServiceV2 {
  private userRepository: IUserRepository;
  constructor(deps: UsersServiceDeps) {
    this.userRepository = deps.UserRepository;
  }

  async getAllUsers(status?: number ): Promise<User[]> {
    const users = await this.userRepository.getAll(status);
    return users;
  }

  async createUser(
    email: string,
    password: string,
    term_url: string,
    company_name: string,
    contact_person: string,
    address: string,
    contact_vat_tax_id: string,
    currency: string,
    ip_address: string,
    amount_threshold: number,
    is_kyc_active: boolean,
    fees: number,
    callback_url: string,
    webhook_endpoint: string,
  ): Promise<User> {
      return this.userRepository.add(
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
      +fees,
      callback_url,
      webhook_endpoint,
    );
  }

  async editUser(
    user_id: number,
    term_url: string,
    company_name: string,
    contact_person: string,
    address: string,
    contact_vat_tax_id: string,
    currency: string,
    ip_address: string,
    amount_threshold: number,
    is_kyc_active: boolean,
    fees: number,
    callback_url: string,
    webhook_endpoint: string,
  ): Promise<User | null> {
    return this.userRepository.edit(
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
      +fees,
      callback_url,
      webhook_endpoint,
    );
  }
  async changeStatus(user_id: number, status: number): Promise<User> { 
    return this.userRepository.changeStatus(user_id, status)
  }

  async getUserByEmail({ email }: { email: string }): Promise<User | null> {
    const user: User | null = await this.userRepository.getUserByEmail({ email });
    return user;
  }

  async getUserById({ user_id }: { user_id: number }): Promise<User | null> {
    const user: User | null = await this.userRepository.getUserById({ user_id });
    return user;
  }
  
  async createSubUser(email: string, password: string, first_name: string, last_name: string, parent_user_id: number): Promise<SubUserResponse | null | Error> {

    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).max(70).required(),
      first_name: Joi.string().min(2).max(70).required(),
      last_name: Joi.string().min(2).max(70).required(),
      parent_user_id: Joi.number().required(),
    });

    errorValidation({
      first_name,
      last_name,
      parent_user_id,
      email,
      password,
    }, schema)

    try {
      const checkSubUser: SubUser | null = await this.userRepository.getSubUserByEmail(email);
      const checkUser: User | null = await this.userRepository.getUserByEmail({ email });
      if (checkSubUser || checkUser) {
        throw ({ code: 422, message: 'email already exists'}); 
      }
      const salt = bcrypt.genSaltSync(10);
      const hash_password = bcrypt.hashSync(password, salt);
      const dataRes = await this.userRepository.createSubUser(email, hash_password, first_name, last_name, parent_user_id);

      return {
        id: dataRes.id,
        email: dataRes.email,
        is_active: dataRes.is_active,
        parent_user_id: dataRes.parent_user_id,
        first_name: dataRes.first_name,
        last_name: dataRes.last_name,
        created_at: dataRes.created_at,
        updated_at: dataRes.updated_at,
      };
    } catch (error) {
      throw ({ code: 422, message: 'email already exists'}); 
    }
  }
  
  async updateSubUser(id: number,  first_name: string, last_name: string, parent_user_id: number, email?: string, password?: string,): Promise<SubUserResponse | null | Error> {
    
    const schema = Joi.object({
      id: Joi.number().required(),
      first_name: Joi.string().min(2).max(70).required(),
      last_name: Joi.string().min(2).max(70).required(),
      email: Joi.string().email().min(2).max(70).required(),
      parent_user_id: Joi.number().required(),
      ...(password && { password: Joi.string().min(2).max(50), })
    });

    errorValidation({
      id,
      first_name,
      last_name,
      parent_user_id,
      ...(email && { email }),
      ...(password && { password })
    }, schema)

    const checkSubUser = await this.userRepository.getSubuserByIdAndBelongsToUser(id, parent_user_id);
    
    if (!checkSubUser) {
      throw ({ code: 422, message: 'sub-user does not exists or does not belong to you.'}); 
    }
    if (password) {
      const salt = bcrypt.genSaltSync(10);
      const hash_password = bcrypt.hashSync(password, salt);
      // tslint:disable-next-line: no-shadowed-variable
      const dataRes = await this.userRepository.updateSubUser(id, first_name, last_name, email, hash_password);

      return {
        id: dataRes.id,
        email: dataRes.email,
        is_active: dataRes.is_active,
        parent_user_id: dataRes.parent_user_id,
        first_name: dataRes.first_name,
        last_name: dataRes.last_name,
        created_at: dataRes.created_at,
        updated_at: dataRes.updated_at,
      };
    }
    const dataRes = await this.userRepository.updateSubUser(id, first_name, last_name, email, '');

    return {
      id: dataRes.id,
      email: dataRes.email,
      is_active: dataRes.is_active,
      parent_user_id: dataRes.parent_user_id,
      first_name: dataRes.first_name,
      last_name: dataRes.last_name,
      created_at: dataRes.created_at,
      updated_at: dataRes.updated_at,
    };
  }
  
  async deleteSubUser(id: number, parent_user_id: number): Promise<SubUserResponse | null> {
    const schema = Joi.object({
      id: Joi.number().required(),
      parent_user_id: Joi.number().required(),
    });
    errorValidation({ id, parent_user_id }, schema)

    const checkSubUser = await this.userRepository.getSubuserByIdAndBelongsToUser(id, parent_user_id);
    if (!checkSubUser) {
      throw ({ code: 422, message: 'sub-user does not exists or does not belong to you.'}); 
    }

    await this.userRepository.deleteSubuserById(checkSubUser);
    const { email, is_active, first_name, last_name, created_at, updated_at } = checkSubUser;
    return {
      id,
      email,
      is_active,
      parent_user_id,
      first_name,
      last_name,
      created_at,
      updated_at,
    };
  }
  
  async getSubusersByUserId(parent_user_id: number, search?: string, page?: number, perPage?: number): Promise<IGetSubusersByUserIdResponse> {
    const schema = Joi.object({
      parent_user_id: Joi.number().required(),
    });
    errorValidation({ parent_user_id }, schema)

    const { data, ...rest } = await this.userRepository.getSubusersByUserIdPaginated(parent_user_id, search, page, perPage);
    return {
      ...rest,
      data: data.map((i: SubUser) => {
        console.log(i, 'iiiii')
        const { id, email, is_active, first_name, last_name, created_at, updated_at } = i;
        return {
          id,
          email,
          is_active,
          parent_user_id,
          first_name,
          last_name,
          created_at,
          updated_at,
        };
      })
    };
  }
  
  async getSubUserByEmail(email: string): Promise<SubUser | null> {
    const user: SubUser | null = await this.userRepository.getSubUserByEmail(email);
    return user;
  }

  async getSubuserById(id: number): Promise<SubUser | null> {
    const user: SubUser | null = await this.userRepository.getSubuserById(id);
    return user;
  }

}