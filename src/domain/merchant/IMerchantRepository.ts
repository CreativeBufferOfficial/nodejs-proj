import MerchantRequests from './../../data/database/models/MerchantRequests';

export interface IMerchantRepository {
    add(
        first_name: string,
        last_name: string,
        company: string,
        email: string,
      ): Promise<MerchantRequests>;

    emailExists(email:string):Promise<boolean>

    hashMatch(
      id:string,
      hash:string,
      ):Promise<boolean>
}