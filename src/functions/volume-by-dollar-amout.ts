import { generateDateHour } from './../utils';
import {
  JSONCSVService,
  SESService,
} from './../services';

import { containerInstance } from './../container';

export async function volumeByDollorAmount(data: any, templateData: any) {

  const jsoncsvService = containerInstance?.resolve<JSONCSVService>('jsoncsvService');
  const sesService = containerInstance?.resolve<SESService>('sesService');
  
  const fields = [
    'id',
    'adax_uuid',
    'customer_details_id',
    'request_uuid',
    'merchant_uuid',
    'first_name',
    'last_name',
    'email',
    'address_ip',
    'currency',
    'card_number',
    'expiry_date',
    'cvc2',
    'transaction_status',
    'response_code',
    'event_result',
    'auto_clear',
    'cof_rof_initial_uuid',
    'fees',
    'refund_status',
    'createdAt',
    'updatedAt',
  ];
  const dataJSON = data;
  const last24HrTransactionsCSV = await jsoncsvService?.generateFile(dataJSON, fields);
  await sesService?.sendEmail(
    'FX Ramp Finance',
    ['finance@fxramp.com'],
    `Transactions has exceeded 250k volume within the previous 24hrs`,
    'last24hrTransactionsVolumeHtml',
    { sender: 'FX Ramp', companyName: templateData.companyName },
    [
      {
        filename: `latest24Hr-transactions-${generateDateHour()}.csv`,
        content: last24HrTransactionsCSV, 
      },
    ],
  );
}
