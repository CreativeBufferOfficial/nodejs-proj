// import User from './user';
import AdminAccount from './../../data/database/models/AdminAccount';

export interface IAdminAccountRepository {
  // getAll(): Promise<AdminAccount[]>;
  // add(
  //   email: string,
  //   password: string,
  //   termURL: string,
  //   company_name: string,
  //   contact_person: string,
  //   address: string,
  //   contact_vat_tax_id: string
  // ): Promise<AdminAccount>;
  getAdminAccountByEmail({ username }: { username: string }): Promise<AdminAccount | null>;
  getAdminAccountById({ user_id }: { user_id: number }): Promise<AdminAccount | null>;
}
