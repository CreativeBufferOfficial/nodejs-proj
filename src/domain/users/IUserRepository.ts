import User from './../../data/database/models/Users';
import SubUser from './../../data/database/models/SubUsers';

export interface IUserRepository {
  getAll(status?: number): Promise<User[]>;
  add(
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
  ): Promise<User>;
  edit(
    user_id: number,
    // password: string,
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
  ): Promise<User | null>;
  changeStatus(user_id: number, status: number): Promise<User>;
  getUserByEmail({ email }: { email: string }): Promise<User | null>;
  getUserById({ user_id }: { user_id: number }): Promise<User | null>;
  getSubUserByEmail(email: string): Promise<SubUser | null>;
  createSubUser(
    email: string,
    password: string,
    first_name: string,
    last_name: string,
    parent_user_id: number,
  ): Promise<SubUser>;
  updateSubUser(
    id: number,
    first_name: string,
    last_name: string,
    email?: string,
    password?: string,
  ): Promise<SubUser>;
  getSubuserByIdAndBelongsToUser(id: number, user_id: number): Promise<SubUser | null>;
  getSubuserById(id: number): Promise<SubUser | null>;
  getSubusersByUserId(user_id: number): Promise<SubUser[]>;
  getSubusersByUserIdPaginated(user_id: number, search?: string, page?: number, perPage?: number): Promise<{  pages: number | undefined; perPage: number | undefined; totalRecordCount: number | undefined; data: SubUser[] }>;
  deleteSubuserById(subUser: SubUser): Promise<boolean>;
}