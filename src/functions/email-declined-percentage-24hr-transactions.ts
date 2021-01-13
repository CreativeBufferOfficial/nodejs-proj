import {
  SESService,
} from './../services';

import { containerInstance } from './../container';

export async function emailDeclinedPercentage24HrTransactions(
  customerEmails: any,
  details: any,
) {
  const sesService = containerInstance?.resolve<SESService>('sesService');
  await sesService?.sendEmail(
    'FX Ramp Finance', 
    customerEmails,
    `${details.companyName} Your Merchant Account Has Reached (${details.declinedPercentage}%) of Rejected Transactions`,
    'riskTolerancePercentageAlertHtml',
    {
      ...details,
    },
  );
}
