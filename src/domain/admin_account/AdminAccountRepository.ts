import AdminAccount from './../../data/database/models/AdminAccount'
// import Joi from '@hapi/joi';
// import UUID from 'uuid';


// DATA LAYER
// AdminAccountRepository:
// is used to provide an abstraction on top of the database ( and possible other data sources)
// so other parts of the application are decoupled from the specific database implementation.
// Furthermore it can hide the origin of the data from it's consumers.
// It is possible to fetch the entities from different sources like inmemory cache,
// network or the db without the need to alter the consumers code.

export class AdminAccountRepository {
  // async getAll(): Promise<AdminAccount[]> {
  //   let admin_accounts: AdminAccount[] = await AdminAccount.findAll({ include: [ CustomerDetails ] });
  //   if (admin_accounts.length) {
  //     admin_accounts = admin_accounts.map(u => {
  //       u.password = "";
  //       return u;
  //     });
  //   }
  //   return admin_accounts;
  // }

  // async add(
  //   email: string,
  //   password: string,
  //   termURL: string,
  //   company_name: string,
  //   contact_person: string,
  //   address: string,
  //   contact_vat_tax_id: string,
  // ): Promise<AdminAccount> {

    // const schema = Joi.object({
    //   email: Joi.string().email().required(),
    //   password: Joi.string().min(6).max(30).required(),
    //   termURL: Joi.string().uri().required(),
    //   company_name: Joi.string().required(),
    //   contact_person: Joi.string().required(),
    //   address: Joi.string().required(),
    //   contact_vat_tax_id: Joi.string().required(),
    // });

    // const { error } = schema.validate({ 
    //     email,
    //     password,
    //     termURL,
    //     company_name,
    //     contact_person,
    //     address,
    //     contact_vat_tax_id,
    //   }, { abortEarly: false });
    // if (error) {
    //   const errorMsg =  error.details.map((e: any) => {
    //     // console.log(e)
    //     // console.log(e.context.key, 'fdffdfqqq')
    //     return {
    //       key : e.context.key,
    //       msg: e.message
    //     };
    //   }).reduce((acc: any, curr: any) => {  
    //     acc[curr.key] = curr.msg;
    //     return acc;
    //   }, {});
    //   throw({ code: 422, message: 'Data validation error', error_messages: errorMsg });
    // }

    // const checkEmailExists =  await this.getAdminAccountByEmail({ email });
    // if (checkEmailExists) {
    //   throw({ code: 422, message: 'User already exists', error_messages: [] });
    // }
    // const admin_account = new AdminAccount({
    //   email,
    //   password,
    //   is_active: 1,
    // });
    // const admin_account_saved = await admin_account.save();
    // if (admin_account_saved) {
    //   const addedUser = await this.getAdminAccountByEmail({ username });
    //   const newCustomerDetails = new CustomerDetails({
    //     termURL,
    //     company_name,
    //     contact_person,
    //     address,
    //     contact_vat_tax_id,
    //     user_id: addedUser?.id,
    //     is_active: 1,
    //   })
    //   await newCustomerDetails.save();
    // }
    // return admin_account_saved;
  // }

  async getAdminAccountByEmail({ username }: { username: string }): Promise<AdminAccount | null> {
    const admin_account: AdminAccount | null = await AdminAccount.findOne({ where: { username }});
    return admin_account;
  }
  async getAdminAccountById({ user_id }: { user_id: number }): Promise<AdminAccount | null> {
    const admin_account: AdminAccount | null = await AdminAccount.findByPk(user_id);
    if (admin_account) {
      admin_account.password = '';
    }
    return admin_account; 
  }
}
