import AdminAccount from './../../data/database/models/AdminAccount';
import { IAdminAccountRepository } from './IAdminAccountRepository';

// DOMAIN LAYER
// Has the userRepository as a dependency. The UserService does not know
// nor does it care where the user models came from. This is abstracted away
// by the implementation of the repositories. It just calls the needed repositories
// gets the results and usually applies some business logic on them.
export class AdminAccountService {
  constructor(private readonly adminRepository: IAdminAccountRepository) { }

  // async getAllUsers(): Promise<AdminAccount[]> {
  //   const users = await this.adminRepository.getAll();
  //   return users;
  // }

  // async createUser(
  //   email: string,
  //   password: string,
  //   termURL: string,
  //   company_name: string,
  //   contact_person: string,
  //   address: string,
  //   contact_vat_tax_id: string,
  // ): Promise<AdminAccount> {
  //     return this.adminRepository.add(
  //     email,
  //     password,
  //     termURL,
  //     company_name,
  //     contact_person,
  //     address,
  //     contact_vat_tax_id
  //   );
  // }

  async getAdminAccountByEmail({ username }: { username: string }): Promise<AdminAccount | null> {
    const admin: AdminAccount | null = await this.adminRepository.getAdminAccountByEmail({ username });
    return admin;
  }
  async getAdminAccountById({ user_id }: { user_id: number }): Promise<AdminAccount | null> {
    const admin: AdminAccount | null = await this.adminRepository.getAdminAccountById({ user_id });
    return admin;
  }
}
