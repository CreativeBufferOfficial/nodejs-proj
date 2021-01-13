import { IMerchantRepository } from './IMerchantRepository';

export class MerchantService {
    constructor(private readonly merchantRepository: IMerchantRepository) { }

    async createMerchant(
        first_name: string,
        last_name: string,
        company: string,
        email: string,
      ): Promise<any> {
          return this.merchantRepository.add(
          first_name,
          last_name,
          company,
          email,
        );
      }


    async getEmailExists(
      email:string
    ):Promise<boolean>{
      return this.merchantRepository.emailExists(
        email
      );
    }
   
    async matchHashMerchant(
      id:string,
      hash:string,
    ):Promise<boolean>{
      return this.merchantRepository.hashMatch(
        id,
        hash,
      );
    }   

}