import awsSdk, { SES } from 'aws-sdk';
import nodemailer from 'nodemailer';

import {
  last24hrTransactionsVolumeHtml,
  riskTolerancePercentageAlertHtml,
  merchantConfirmation,
} from './../email-templates';
const emailTemplates: any = {
  last24hrTransactionsVolumeHtml,
  riskTolerancePercentageAlertHtml,
  merchantConfirmation,
};
interface KeyVal { [key: string]: string; }
export class SESService {
  private sesClient: SES;
  private s3Nodemailer: nodemailer.Transporter;
  private sesEmailSenderes: KeyVal = { ['FX Ramp Finance']: 'finance@fxramp.com' };
  constructor() {
    this.sesClient = new awsSdk.SES({
      accessKeyId: process.env.ACCESS_KEY_ID,
      secretAccessKey: process.env.SECRET_ACCESS_KEY,
      region: 'ap-southeast-1',
    });

    this.s3Nodemailer = nodemailer.createTransport({ SES: this.sesClient });
  }

  async sendEmail(
    sender: string,
    recepient: string[],
    subject: string,
    template: string,
    templateData: KeyVal | null = null,
    attachments: any = null,
  ) {
    const selectedSender = this.sesEmailSenderes[sender];

    let htmlTemplate: string = emailTemplates[template];
    if (templateData) {
      Object.keys(templateData).map((key) => {
        htmlTemplate = htmlTemplate
          .replace(`{{${key}}}`, templateData[key]);
      });
    }

    const mailOptions = {
      subject,
      from: selectedSender,
      html: htmlTemplate,
      to: recepient,
      ...(attachments && attachments.length && { attachments }),
    };
    console.log(mailOptions, 'mailOptionsmailOptions');
    this.s3Nodemailer.sendMail(mailOptions)
      .then((data) => {
        console.log('SESService_SEND_EMAIL: ', data);
        return data;
      })
      .catch((error) => {
        console.log('SESService_SEND_EMAIL_ERROR: ', error);
        return error;
      });
  }
}
