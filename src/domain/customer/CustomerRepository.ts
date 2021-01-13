import { CustomerDetails } from './../../data/database';

import {
  ICustomerRepository,
  IGetAllCustomersResponse,
  IGetAllCustomersDataResponseModel,
} from './Customer.interfaces';

export class CustomerRepository implements ICustomerRepository {
  async getCustomers(): Promise<IGetAllCustomersResponse> {
    const customerDetails = await CustomerDetails.findAll({
      where: {
        is_active: 1,
      },
    });

    if (!customerDetails.length) {
      return {
        data: [],
      };
    }

    return {
      data: customerDetails.map(({ company_name, company_uuid, user_id }): IGetAllCustomersDataResponseModel => 
        ({
          company_uuid,
          company_name,
          user_id,
        })
      )
    };
  }

  async getCustomer({ companyUUID }: { companyUUID: string; }): Promise<IGetAllCustomersDataResponseModel | null> {
    const customerDetails = await CustomerDetails.findOne({
      where: { company_uuid: companyUUID },
      attributes: ['company_uuid', 'company_name', 'user_id']
    });
    return customerDetails;
  }

}