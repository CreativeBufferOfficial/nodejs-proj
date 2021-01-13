
export interface IGetAllCustomersDataResponseModel {
  company_uuid: string;
  company_name: string;
  user_id?: number;
}

export interface IGetAllCustomersResponse {
  data: IGetAllCustomersDataResponseModel[],
}

export interface ICustomerRepository {
  getCustomers(): Promise<IGetAllCustomersResponse>
  getCustomer({ companyUUID }: { companyUUID: string }): Promise<IGetAllCustomersDataResponseModel | null>
}







export interface ICustomerServiceDependecies {
  CustomerRepository: ICustomerRepository,
}

export interface ICustomerService {
  getCustomers(): Promise<IGetAllCustomersResponse>
  getCustomer({ companyUUID }: { companyUUID: string }): Promise<IGetAllCustomersDataResponseModel | null>
}