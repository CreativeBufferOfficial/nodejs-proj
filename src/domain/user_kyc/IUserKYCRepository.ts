import UserKYC from './../../data/database/models/UserKYC';
import BlockPassCustomerClientKYC from './../../data/database/models/BlockPassCustomerClientKYC';
export interface IUserKYCData {
  customer_id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  company_uuid: string;
  user_id?: number;
  address?: string;
  // provider: null;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date
}

export interface IUserKYCRepository {
  getAll(): Promise<UserKYC[] | []>;
  getByEmail(email: string): Promise<UserKYC | null>;
  getAllByCustomer({ user_id, searchQuery, kycStatus, page, perPage }: { user_id: number, searchQuery: string, kycStatus: string, page: number, perPage: number }): Promise<{ records: IUserKYCData[] | null, numOfPages: number, totalRecordCount: number, perPage: number }>;
  saveBlockPassKYC(userId: number, email: string, refId: string): Promise<BlockPassCustomerClientKYC | null>;
  getAllBlockPassKYC(): Promise<BlockPassCustomerClientKYC[] | [] | null>;
  getBlockPassKYCByEmailCustomer(userId: number, email: string): Promise<BlockPassCustomerClientKYC | null>;
  getBlockPassKYC(args: any): Promise<BlockPassCustomerClientKYC | null>;
  getAllBlockPassByCustomer(userId: number, searchQuery: string, kycStatus: string, page: number, perPage: number):
    Promise<{ records: BlockPassCustomerClientKYC[] | null, numOfPages: number, totalRecordCount: number, perPage: number }>;
  saveData(data: IUserKYCData): Promise<IUserKYCData>;
}
export default IUserKYCRepository;