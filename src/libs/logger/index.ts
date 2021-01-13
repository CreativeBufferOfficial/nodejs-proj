import bunyan from 'bunyan';
var logBunyan = bunyan.createLogger({ name: 'Payment Gateway' });

export const logger = {
  info(msgObj: any) {
    logBunyan.info(msgObj)
  },
  error(msgObj: any) {
    logBunyan.warn(msgObj)
  },
  warn(msgObj: any) {
    logBunyan.error(msgObj)
  }
};