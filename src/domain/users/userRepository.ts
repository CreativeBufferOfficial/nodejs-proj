import User from './../../data/database/models/Users'
import CustomerDetails from './../../data/database/models/CustomerDetails'
import Joi from '@hapi/joi';
import bcrypt from 'bcryptjs';
import UUID from 'uuid';
import { IUserRepository } from './IUserRepository';
import SubUser from '../../data/database/models/SubUsers';

// DATA LAYER
// UserRepository:
// is used to provide an abstraction on top of the database ( and possible other data sources)
// so other parts of the application are decoupled from the specific database implementation.
// Furthermore it can hide the origin of the data from it's consumers.
// It is possible to fetch the entities from different sources like inmemory cache,
// network or the db without the need to alter the consumers code.

export class UserRepository implements IUserRepository {
  async getAll(status?: number): Promise<User[]> {
    let conditions = {}
    if (status) {
      conditions = { where : { is_active: status } }
    }
    let users: User[] = await User.findAll({ ...conditions,  include: [ CustomerDetails ] });
    if (users.length) {
      users = users.map(u => {
        u.password = "";
        return u;
      });
    }
    return users;
  }

  async add(
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

    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).max(30).required(),
      term_url: Joi.string().uri().required(),
      company_name: Joi.string().required(),
      contact_person: Joi.string().required(),
      address: Joi.string().required(),
      contact_vat_tax_id: Joi.string().required(),
      currency: Joi.string().required(),
      ip_address: Joi.string().required(),
      amount_threshold: Joi.number().min(0).max(1000000).required(),
      is_kyc_active: Joi.boolean().required(),
      fees: Joi.number().min(0).max(100).required(),
      callback_url: Joi.string().allow('').optional().uri(),
      webhook_endpoint: Joi.string().allow('').optional().uri(),
    });

    const { error } = schema.validate({ 
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
      throw({ code: 422, message: 'Data validation error', error_messages: errorMsg });
    }

    const checkEmailExists =  await this.getUserByEmail({ email });
    const checkSubUser = await this.getSubUserByEmail(email);
    // console.log(checkEmailExists, 'checkEmailExists')
    if (checkEmailExists || checkSubUser) {
      throw({ code: 422, message: 'User already exists', error_messages: [] });
    }

    const salt = bcrypt.genSaltSync(10);
    const hash_password = bcrypt.hashSync(password, salt);
    const newUser = new User({
      email,
      password: hash_password,
    });
    const newUserSaved = await newUser.save();
    if (newUserSaved) {
      const company_uuid = UUID.v4();
      const term_uuid = UUID.v4();
      const addedUser: User | null = await this.getUserByEmail({ email });

      const newCustomerDetails = new CustomerDetails({
        company_uuid,
        term_url,
        term_uuid,
        company_name,
        contact_person,
        address,
        contact_vat_tax_id,
        user_id: addedUser?.id,
        currency,
        ip_address,
        is_active: 1,
        amount_threshold,
        is_kyc_active,
        fees,
        callback_url,
        webhook_endpoint,
      })
      await newCustomerDetails.save();
    }
    const addedUser = await this.getUserByEmail({ email: newUser.email });
    addedUser!.password = "";
    return addedUser!;
  }

  async edit(
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
      const user: User | null = await User.findByPk(user_id);
      if (!user) {
        throw({ code: 422, message: 'user does not exists.', error_messages: [] });
      }
      console.log(callback_url, 'fdfdsfsdfppp')
      console.log(webhook_endpoint, 'webhook_endpoint')
      
      const schema = Joi.object({
        term_url: Joi.string().uri().required(),
        company_name: Joi.string().required(),
        contact_person: Joi.string().required(),
        address: Joi.string().required(),
        contact_vat_tax_id: Joi.string().required(),
        currency: Joi.string().required(),
        ip_address: Joi.string().required(),
        amount_threshold: Joi.number().min(0).max(1000000).required(),
        is_kyc_active: Joi.boolean().required(),
        fees: Joi.number().min(0).max(100).required(),
        callback_url: Joi.string().allow('').optional().uri(),
        webhook_endpoint: Joi.string().allow('').optional().uri(),
      });

      const { error } = schema.validate({ 
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
        throw({ code: 422, message: 'Data validation error', error_messages: errorMsg });
      }
      const customer_details: CustomerDetails | null = await CustomerDetails.findOne({ where: { user_id: user.id } });
      customer_details!.term_url = term_url;
      customer_details!.company_name = company_name;
      customer_details!.contact_person = contact_person;
      customer_details!.address = address;
      customer_details!.contact_vat_tax_id = contact_vat_tax_id;
      customer_details!.currency = currency;
      customer_details!.ip_address = ip_address;
      customer_details!.amount_threshold = amount_threshold;
      customer_details!.is_kyc_active = is_kyc_active;
      customer_details!.fees = fees;
      customer_details!.callback_url = callback_url;
      customer_details!.webhook_endpoint = webhook_endpoint;
      await customer_details?.save();

      const updatedUser: User | null = await User.findOne({ where: { id: user_id }, include: [ CustomerDetails ] });
      updatedUser!.password = "";
      return updatedUser;
  }

  async changeStatus(user_id: number, status: number): Promise<User> {
    const user = await User.findByPk(user_id);
    if (!user) {
      throw({ code: 422, message: 'user does not exists.', error_messages: [] });
    }
    user.is_active = status;
    await user.save();

    const updatedUser = await User.findOne({ where: { id: user_id }, include: [ CustomerDetails ] });
    updatedUser!.password = '';
    return updatedUser!;
  }

  async getUserByEmail({ email }: { email: string }): Promise<User | null> {
    const user: User | null = await User.findOne({ where: { email }, include: [ CustomerDetails ] });
    return user;
  }
  
  async getUserById({ user_id }: { user_id: number }): Promise<User | null> {
    const user: User | null = await User.findOne({ where: { id: user_id }, include: [ CustomerDetails ] });
    if (user) {
      user.password = '';
    }
    return user;
  }

  async getSubUserByEmail(email: string): Promise<SubUser | null> {
    const subUser: SubUser | null = await SubUser.findOne({ where: { email }, include: ['customer_details'] });
    return subUser;
  }

  async createSubUser(email: string, password: string, first_name: string, last_name: string, parent_user_id: number): Promise<SubUser> {
    const subUser: SubUser = await SubUser.create({ email, password, first_name, last_name, parent_user_id });
    await subUser.save();
    return subUser;
  }

  async updateSubUser(id: number, first_name: string, last_name: string, email?: string, password?: string): Promise<SubUser> {
    const subUser: SubUser | null = await SubUser.findOne({ where: { id } }) as SubUser;
    if (password) {
      subUser.password = password;
    }
    if (email) {
      subUser.email = email;
    }
    subUser.first_name = first_name;
    subUser.last_name = last_name;
    subUser.save();
    return subUser;
  }

  async getSubuserByIdAndBelongsToUser(id: number, user_id: number): Promise<SubUser | null> {
    const subUser: SubUser | null = await SubUser.findOne({ where: { id, parent_user_id: user_id }});
    return subUser;
  }
  
  async getSubuserById(id: number): Promise<SubUser | null> {
    const subUser: SubUser | null = await SubUser.findOne({ where: { id }, include: [ CustomerDetails ] });
    return subUser;
  }

  async deleteSubuserById(subUser: SubUser): Promise<boolean> {
    try {
      subUser.is_active = 0; 
      await subUser.save();
      return true;
    } catch (error) {
      console.log(error, 'errrr');
      throw({ code: 422, message: 'Something went wrong while deleting a record.' });
    }
  }

  async getSubusersByUserId(user_id: number): Promise<SubUser[]> {
    const subUsers: SubUser[] = await SubUser.findAll({ where: { parent_user_id: user_id, is_active: 1 } });
    return subUsers;
  }

  async getSubusersByUserIdPaginated(user_id: number, search?: string, page?: number, perPage?: number): Promise<{  pages: number | undefined; perPage: number | undefined; totalRecordCount: number | undefined; data: SubUser[] }> {
    const { count: totalRecordCount } = await SubUser.findAndCountAll({
      where: { parent_user_id: user_id, is_active: 1 },
    });
    console.log(search, 'searchsearch')
    const pages = perPage ? (totalRecordCount / perPage) : 0;
    const subUsers: SubUser[] = await SubUser.findAll({
      where: { parent_user_id: user_id, is_active: 1 },
      ...( perPage && page &&
        { 
          limit: perPage,
          offset: (page - 1) * perPage
        }
      ),
    });
    return {
      pages,
      perPage,
      totalRecordCount,
      data: subUsers,
    };
  }

}