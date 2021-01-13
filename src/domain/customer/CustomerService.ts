import {
  IGetAllCustomersResponse,
  ICustomerService,
  ICustomerServiceDependecies,
  IGetAllCustomersDataResponseModel,
  ICustomerRepository,
} from './Customer.interfaces';


export class CustomerService implements ICustomerService {
  private CustomerService: ICustomerRepository
  constructor (deps: ICustomerServiceDependecies) {
    this.CustomerService = deps.CustomerRepository;
  }

  async getCustomers(): Promise<IGetAllCustomersResponse> {
    return this.CustomerService.getCustomers();
  }

  getCustomer({ companyUUID }: { companyUUID: string }): Promise<IGetAllCustomersDataResponseModel | null> {
    try {
      return this.CustomerService.getCustomer({ companyUUID }); 
    } catch (error) {
      throw(error);
    }
  }
}