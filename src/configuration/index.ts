import dotenv from 'dotenv';
dotenv.config();

/**
 * This module is used to collect all the configuration variables,
 * like the environment vars, in one place so they are not scattered all over the whole codebase
 */
var fenigeUrl:string = "https://ecom-staging.fenige.pl/client/payments/"; 

export const config = {
  port: process.env.PORT || 5000,
  
  // project configs
  Page: 1,
  Limit: 10, 

  // environment configs
  DBHost:  process.env.DB_HOST,
  DBPort:  process.env.DB_PORT,
  DBUser:  process.env.DB_USER,
  DBPassword:  process.env.DB_PASSWORD,
  DBName: process.env.DB_NAME,

  // Fenige config
  ADAXUser : "Mobilum",
  ADAXPassword : "KaszyckiW@781",
  MerchantUuid : "5121669f-03a8-4d63-8c0c-1a609591f93c",

  FenigeUrl : fenigeUrl,
  PaymentUrl :    fenigeUrl + "auth",
  PaymentDetailUrl :  fenigeUrl + "query/",

  FENIGE_BASEURL: process.env.FENIGE_BASEURL,

  BLOCKPASS_ENV: process.env.BLOCKPASS_ENV,
  BLOCKPASS_CLIENTID: process.env.BLOCKPASS_CLIENTID,
  BLOCKPASS_APIKEY: process.env.BLOCKPASS_APIKEY,
  BLOCKPASS_BASEURL: process.env.BLOCKPASS_BASEURL,
  BLOCKPASS_WEBHOOK_APIKEY: process.env.BLOCKPASS_WEBHOOK_APIKEY,
  
};