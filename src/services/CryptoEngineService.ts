import axios, { AxiosInstance } from 'axios';


interface ProcessTransferResponse {
  requestUUID: string;
  quotePrice: number;
  originalPurchasedPrice: number;
  companyUUID: string;
  markupFee: number;
  markupFeePercentage: number;
  finalPrice: number;
  quantity: number;
  baseCurrency: string;
  quoteCurrency: string;
  proceedsCurrency: string;
  wallet: string;
  requestedAt: Date;
  quotedAt: Date;
  createdAt: Date;
  transferred: boolean;
  fullySettledAt: Date
}

interface IGetPricingResponse {
  meta: {
    time: Date;
  };
  result: {
    symbol: string;
    askPrice: number;
  }
}

interface IGetStatusResponse {
  meta: {
    time: Date;
  };
  result: ProcessTransferResponse & {
    email: string;
    txId: string;
    initialTransfer: boolean;
    status: string;
  }
}

interface ICreateQuoteRequest {
  requestUUID: string;
  email: string;
  amount: number;
  walletAddress: string;
  companyUUID: string;
}

export interface ICryptoEngineService {
  processTransfer({ requestUUID }: { requestUUID: string; }): Promise<ProcessTransferResponse>;
  markReady({ requestUUID }: { requestUUID: string; }): Promise<ProcessTransferResponse>;
  markCancelled({ requestUUID }: { requestUUID: string; }): Promise<ProcessTransferResponse | null>;
  getPricing({ symbol }: { symbol: string; }): Promise<IGetPricingResponse>;
  getStatus({ queryString }: { queryString: string; }): Promise<IGetStatusResponse | null>;
  createQuote(req: ICreateQuoteRequest): Promise<IGetStatusResponse>;
}

export class CryptoEngineService
  implements ICryptoEngineService {
  private axiosInstance: AxiosInstance;
  constructor() {
    this.axiosInstance = axios.create();
  }

  async processTransfer({ requestUUID }: { requestUUID: string; }): Promise<ProcessTransferResponse> {
    const { data }: { data: any } = await this.axiosInstance.post(`${process.env.CRYPTO_ENGINE_URL}/api/v1/transfer`, { requestUUID });
    return {
      ...data.result
    };
  }

  async markReady({ requestUUID }: { requestUUID: string; }): Promise<ProcessTransferResponse> {
    const { data }: { data: any } = await this.axiosInstance.post(`${process.env.CRYPTO_ENGINE_URL}/api/v1/crypto/purchase-ready?requestUUID=${requestUUID}`);
    return {
      ...data.result
    };
  }

  async markCancelled({ requestUUID }: { requestUUID: string; }): Promise<ProcessTransferResponse | null> {
    try {
      const { data }: { data: any } = await this.axiosInstance.post(`${process.env.CRYPTO_ENGINE_URL}/api/v1/crypto/purchase-cancel?requestUUID=${requestUUID}`);
      return {
        ...data.result
      }; 
    } catch (error) {
      return null;
    }
  }

  async getPricing({ symbol }: { symbol: string; }): Promise<IGetPricingResponse> {
    const { data }: { data: any } = await this.axiosInstance.get(`${process.env.CRYPTO_ENGINE_URL}/api/v1/crypto/pricing?symbol=${symbol}`);
    return data;
  }

  async getStatus({ queryString }: { queryString: string; }): Promise<IGetStatusResponse | null> {
    try {
      const { data }: { data: any } = await this.axiosInstance.get(`${process.env.CRYPTO_ENGINE_URL}/api/v1/crypto/status?${queryString}`);
      /**
       *  1 - OPEN - initial process/quote created
       *  2 - READY - payment approved/cleared
       *  3 - IN PROCESS - processing by the background job
       *  4 - COMPLETED - transferred
       *  5 - DECLINED
       */
      if (Array.isArray(data.result) && data.result.length) {
        const manipulatedData = data.result.map((i: any) => {
          let status = 'OPEN';
          if (i.status === 0) {
            status = 'CANCELLED';
          } else if (i.status === 2) {
            status = 'READY';
          } else if (i.status === 3) {
            status = 'IN PROCESS';
          } else if (i.status === 4) {
            status = 'COMPLETED';
          } else if (i.status === 5) {
            status = 'DECLINED';
          }
          return { ...i, status };
        })
        return {
          meta: data.meta,
          result: manipulatedData
        };
      }
      let status = 'OPEN';
      if (data.result.status === 0) {
        status = 'CANCELLED';
      } else if (data.result.status === 2) {
        status = 'READY';
      } else if (data.result.status === 3) {
        status = 'IN PROCESS';
      } else if (data.result.status === 4) {
        status = 'COMPLETED';
      } else if (data.result.status === 5) {
        status = 'DECLINED';
      }
      if (!data.result.status) {
        return {
          ...data,
          result: {},
        };
      }
      return {
        ...data,
        result: {
          ...data.result,
          status,
        }
      };
    } catch (error) {
      return null;
    }
  }

  async createQuote(reqData: ICreateQuoteRequest): Promise<IGetStatusResponse> {
    const { data }: { data: any } = await this.axiosInstance.post(`${process.env.CRYPTO_ENGINE_URL}/api/v1/crypto/quote`, {
      ...reqData,
      company_uuid: reqData.companyUUID,
    });
    return data;
  }
}