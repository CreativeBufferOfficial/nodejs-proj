import { IUserRepository } from './IUserRepository';
import SubUser from '../../data/database/models/SubUsers';

export interface SubUserResponse {
  id: number,
  email: string,
  is_active: number,
  parent_user_id: number,
  first_name: string,
  last_name: string,
  created_at: Date,
  updated_at: Date,
}

export interface IGetSubusersByUserIdResponse {
  pages: number | undefined;
  perPage: number | undefined;
  totalRecordCount: number | undefined;
  data: SubUserResponse[] 
}

export interface UsersServiceDeps {
  UserRepository: IUserRepository
}

export interface IUsersServiceV2 {
  getSubuserById(id: number): Promise<SubUser | null>;
  getSubusersByUserId(parent_user_id: number, search?: string, page?: number, perPage?: number): Promise<SubUserResponse[]>;
  deleteSubUser(id: number, parent_user_id: number): Promise<SubUserResponse | null>;
  updateSubUser(id: number,  first_name: string, last_name: string, parent_user_id: number, email?: string, password?: string): Promise<SubUserResponse | null | Error>;
  createSubUser(email: string, password: string, first_name: string, last_name: string, parent_user_id: number): Promise<SubUserResponse | null | Error>;
}
