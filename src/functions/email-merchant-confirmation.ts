import {
    SESService,
  } from './../services';
  
  import { containerInstance } from './../container';
  
  export async function emailMerchantConfirmation(
    customerEmails: any,
    details: any,
  ) {
    const sesService = containerInstance?.resolve<SESService>('sesService');
    await sesService?.sendEmail(
      'FX Ramp Finance', 
      customerEmails,
      `Tests`,
      'merchantConfirmation',    
      {
        ...details,
      },
    );
  }
  