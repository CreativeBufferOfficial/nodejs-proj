import UserKYC from './../../data/database/models/UserKYC';
import BlockPassCustomerClientKYC from './../../data/database/models/BlockPassCustomerClientKYC';
import IUserKYCRepository, { IUserKYCData } from './IUserKYCRepository';
import sequelize from "sequelize";
// tslint:disable-next-line: no-duplicate-imports
import { Op } from "sequelize";



export class UserKYCRepository implements IUserKYCRepository {
  async getByEmail(email: string): Promise<UserKYC | null> {
    const userKYC: UserKYC | null = await UserKYC.findOne({ where: { email } });
    return userKYC;
  }
  async getAll(): Promise<UserKYC[] | []> {
    const userKYC: UserKYC[] | null = await UserKYC.findAll();
    return userKYC;
  }
  async getAllByCustomer({
    user_id,
    searchQuery,
    kycStatus,
    page,
    perPage
  }: {
    user_id: number,
    searchQuery: string,
    kycStatus: string,
    page: number,
    perPage: number
  }): Promise<{
    records: IUserKYCData[] | null,
    numOfPages: number,
    totalRecordCount: number,
    perPage: number
  }> {
    const recordCount: UserKYC[] | null = await UserKYC.findAll({
      where: {
        user_id,
        ...( kycStatus && { status: kycStatus }  ),
        [Op.or]: [
          { email: { [Op.like]: `%${searchQuery}%` } },
          { first_name: { [Op.like]: `%${searchQuery}%` } },
          { last_name: { [Op.like]: `%${searchQuery}%` } },
        ]
      },
      attributes: [[sequelize.fn('COUNT', sequelize.col('running_id')), 'dataRecords']]
    });

    const showPerPage: number = (perPage || 2) as number;
    const currentPage: number = (page || 1) as number;
    const totalRecordCount: number = recordCount[0].get('dataRecords') as number;
    const numOfPages: number = Math.ceil(totalRecordCount / showPerPage);
    const offset: number = (currentPage - 1) * showPerPage;

    const userKYC: UserKYC[] | null = await UserKYC.findAll({
      offset,
      where: {
        user_id,
        ...( kycStatus && { status: kycStatus }  ),
        [Op.or]: [
          { email: { [Op.like]: `%${searchQuery}%` } },
          { first_name: { [Op.like]: `%${searchQuery}%` } },
          { last_name: { [Op.like]: `%${searchQuery}%` } },
        ]
      },
      attributes: [
        'ref_id',
        'email',
        'status',
        'company_uuid',
        'created_at',
        'updated_at',
        'deleted_at',
      ],
      limit: showPerPage,
    });
    let userKYCData: IUserKYCData[]  = [];
    if (userKYC) {
      userKYCData = userKYC.map(u => {
        return {
          customer_id: u.customer_id,
          ref_id: u.ref_id,
          first_name: u.first_name,
          last_name: u.last_name,
          email: u.email,
          status: u.status ? u.status === 'verified-status' ? 'approved' : u.status : '' ,
          company_uuid: u.company_uuid,
          // provider: null,
          created_at: u.created_at,
          updated_at: u.updated_at,
          deleted_at: u.deleted_at
        }
      })
    }
    return { numOfPages, totalRecordCount, perPage, records: userKYCData, }
  }
  async saveBlockPassKYC(userId: number, email: string, refId: string): Promise<BlockPassCustomerClientKYC| null> {
    const newKyc = new BlockPassCustomerClientKYC({ email, userId, refId });
    await newKyc.save();
    return newKyc;
  }
  async getAllBlockPassKYC(): Promise<BlockPassCustomerClientKYC[] | [] | null> {
    const usersKyc = await BlockPassCustomerClientKYC.findAll({});
    return usersKyc;
  } 
  async getBlockPassKYCByEmailCustomer(userId: number, email: string): Promise<BlockPassCustomerClientKYC| null> {
    const userKyc = await BlockPassCustomerClientKYC.findOne({ where: { email, userId } });
    return userKyc;
  }
  async getBlockPassKYC(args: any): Promise<BlockPassCustomerClientKYC| null> {
    const userKyc = await BlockPassCustomerClientKYC.findOne({ where: { ...args } });
    return userKyc;
  }
  
  async getAllBlockPassByCustomer(
    userId: number,
    searchQuery: string,
    kycStatus: string,
    page: number,
    perPage: number ): Promise<{
    records: BlockPassCustomerClientKYC[] | null,
    numOfPages: number,
    totalRecordCount: number,
    perPage: number
  }> {
    const recordCount: BlockPassCustomerClientKYC[] | null = await BlockPassCustomerClientKYC.findAll({
      where: {
        user_id: userId,
        ...( kycStatus && { status: kycStatus }  ),
        [Op.or]: [
          { email: { [Op.like]: `%${searchQuery}%` } },
        ]
      },
      attributes: [[sequelize.fn('COUNT', sequelize.col('id')), 'dataRecords']]
    });

    const showPerPage: number = (perPage || 2) as number;
    const currentPage: number = (page || 1) as number;
    const totalRecordCount: number = recordCount[0].get('dataRecords') as number;
    const numOfPages: number = Math.ceil(totalRecordCount / showPerPage);
    const offset: number = (currentPage - 1) * showPerPage;

    const BlockPassCustomerClientKYCData: BlockPassCustomerClientKYC[] | null = await BlockPassCustomerClientKYC.findAll({
      offset,
      where: {
        user_id: userId,
        ...( kycStatus && { status: kycStatus }  ),
        [Op.or]: [
          { email: { [Op.like]: `%${searchQuery}%` } },
        ]
      },
      limit: showPerPage,
    });
    return { numOfPages, totalRecordCount, perPage, records: BlockPassCustomerClientKYCData, }
  }
  
  async saveData(data: IUserKYCData): Promise<IUserKYCData> {
    try {
      const newUserKYC = new UserKYC({ ...data });
      const newUserKYCSaved = await newUserKYC.save();
      return newUserKYCSaved;
    } catch (error) {
      throw(error)
    }
  }
}

export default UserKYCRepository;