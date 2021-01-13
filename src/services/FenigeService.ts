import axios, { AxiosInstance } from 'axios';

interface IPayment3DSAuthParams {
  requestUuid: string;
  firstName: string;
  lastName: string;
  email: string;
  addressIp: string;
  amount: number;
  currency: string;
  cardNumber: string;
  expiryDate: string;
  cvc2: string;
  autoClear: boolean;
  fenigeUsername?: string;
  fenigePassword?: string;
  merchantUUID?: string;
}

interface IFenigeServiceParams {
  config: any,
}

export interface IFenigeService {
  payment3DSAuth(params: IPayment3DSAuthParams): Promise<any>
}

export class FenigeService implements IFenigeService{
  private axiosInstance: AxiosInstance;
  private config: any;
  constructor({ config: { FenigeUrl, ADAXUser: fenigeUsername, ADAXPassword: fenigePassword, MerchantUuid } }: IFenigeServiceParams) {
    this.axiosInstance = axios.create();
    this.axiosInstance.defaults.baseURL = FenigeUrl;
    this.config = {
      fenigeUsername,
      fenigePassword,
      MerchantUuid,
    };
  }

  async payment3DSAuth (params: IPayment3DSAuthParams): Promise<any> {
    try {
      const requestData = {
          merchantUuid : params.merchantUUID || '',
          requestUuid: params.requestUuid,
          firstName: params.firstName,
          lastName: params.lastName,
          amount: params.amount,
          currency: params.currency,
          cardNumber: params.cardNumber,
          expiryDate: params.expiryDate,
          cvc2: params.cvc2,
          email: params.email,
          addressIp: params.addressIp,
          autoClear: params.autoClear
      };
      const authHeader = Buffer
        .from(`${params.fenigeUsername || this.config.fenigeUsername}:${params.fenigePassword || this.config.fenigePassword}`)
        .toString('base64');
      const { data } = await this.axiosInstance
        .post(
          '/auth',
          requestData,
          {
            headers: {
              Authorization: `Basic ${authHeader}`,
              'Content-Type': 'application/json'
            }
          }
        );
      return data;
    } catch (error) {
      if (error.isAxiosError) {
        throw ({
          code: error.response.status,
          statusCode: error.response.status,
          message: error.response.data.message,
          errorCode: error.response.data.status,
          errorMessage: error.response.data.message,
          errors: error.response.data.errors,
        });
      }
      throw({
        code: 422,
        statusCode: 422,
        message: 'Unable to proceed',
        errorCode: 'E10001',
        errorMessage: 'Internal server error',
        errors: [],
      });
    }
  }
}