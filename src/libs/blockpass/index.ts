import axios from 'axios';
import { config } from './../../configuration';
export const checkBlockPassKYCStatus = (refId: string) => {
  return axios({
    // url: 'https://kycstaging.adaxtech.com/kyc/1.0/sdk/endpoint/adaxtech_sandbox_0819/status',
    url: `${config.BLOCKPASS_BASEURL}/kyc/1.0/connect/${config.BLOCKPASS_CLIENTID}/refId/${refId}`,
    method: 'GET',
    headers: {
        'Authorization': `${config.BLOCKPASS_APIKEY}`
    }
  });
}