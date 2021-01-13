const request = require("request");
import axios from 'axios';
import { AxiosResponse } from 'axios';
import { config } from '../../configuration';

export function fenigeAddTransaction(
        requestUuid: string,
        termUuid: string,
        firstName: string,
        lastName: string,
        email: string,
        addressIp: string,
        amount: number,
        currency: string,
        cardNumber: string,
        expiryDate: string,
        cvc2: string,
        autoClear: boolean,
        fenigeUsername?: string,
        fenigePassword?: string,
        merchantUUID?: string,
        ) {
        console.log(termUuid, 'terererer');
        return new Promise((resolve, reject) => {
            const postData = {
                "merchantUuid" : merchantUUID || config.MerchantUuid,
                // "terminalUuid" : termUuid,
                "requestUuid" : requestUuid,
                "firstName" : firstName,
                "lastName" : lastName,
                "amount" : amount,
                "currency" : currency,
                "cardNumber" : cardNumber,
                "expiryDate" : expiryDate,
                "cvc2" : cvc2,
                "email" : email,
                "addressIp" : addressIp,
                "autoClear" : autoClear
            };
            var url = config.PaymentUrl;
            var auth = Buffer.from(`${fenigeUsername || config.ADAXUser}:${fenigePassword || config.ADAXPassword}`).toString('base64');
            var options = {
                method: 'post',
                body: postData,
                json: true,
                url: url,
                headers: {
                    Authorization: 'Basic ' + auth,
                    'Content-Type': 'application/json'
                }
            };
            console.log('fenigePayment Data: ', options);
            request(options, function (err: any, res: any, body: any) {
                if (err) {
                    console.log('error posting json: ', err);
                    // throw err;
                    reject(err);
                }
                else {
                    
                    var headers = res.headers;
                    var statusCode = res.statusCode;
                    console.log('--------------------------');
                    console.log('fenigePayment');
                    console.log('--------------------------');
                    console.log('headers: ', headers);
                    console.log('statusCode: ', statusCode);
                    console.log('body: ', body);
                    console.log('===========================');
                    var data = { 'body' : body, 'statusCode': statusCode };
                    resolve(data);
                }
            });
        });
}

export function fenigePaymentStatus(
    requestUuid: string,
    ): Promise<any> {
    return new Promise((resolve, reject) => {
        var url = config.PaymentDetailUrl + requestUuid;
        var auth = Buffer.from(config.ADAXUser + ':' + config.ADAXPassword).toString('base64');;
        var options = {
            method: 'get',
            json: true,
            url: url,
            headers: {
                Authorization: 'Basic ' + auth
            }
        };
        console.log('fenigePayment Data: ', options);
        request(options, function (err: any, res: any, body: any) {
            if (err) {
                console.log('error posting json: ', err);
                // throw err;
                reject(err);
            }
            else {
                var headers = res.headers;
                var statusCode = res.statusCode;
                console.log('--------------------------');
                console.log('fenigePayment');
                console.log('--------------------------');
                console.log('headers: ', headers);
                console.log('statusCode: ', statusCode);
                console.log('body: ', body);
                console.log('===========================');
                resolve(body);
            }
        });
    });
}

export const fenigePaymentClient3dsVerify = async <T>(cardNumber: string): Promise<T | string> => {
    try {
        const url = `${config.FENIGE_BASEURL}/client/3ds/verify`
        var auth = Buffer.from(config.ADAXUser + ':' + config.ADAXPassword).toString('base64');
        const res = await axios({
            url,
            method: 'POST',
            headers: {
                Authorization: 'Basic ' + auth,
                ContentType: 'application/json'
            },
            data: {
                cardNumber
            }
        });
        console.log('fenigePaymentFinalize_RESPONSE' , res.data);
        if (!res.data.enrolledStatus) {
            throw({ code: 500, error: 'enrolled status not found' })
        }

        return res.data.enrolledStatus;

    } catch (error) {
        console.log('fenigePaymentClient3dsVerify_ERROR' , error);
        // if (error.hasOwnProperty('isAxiosError') && error.isAxiosError) {
        //     console.log('fenigePaymentFinalize_ERROR_RES' , error);
        //     throw({ code: error.response.status, message: 'unable to process', error: error.response.data })
        // }
        // throw({ code: 500, error })
        return "N"
    }
}

export const fenigePaymentFinalize = async (pares: string, md: string): Promise<any> => {
    try {
        const url = `${config.FENIGE_BASEURL}/client/3ds/finalize`
        // const url = `https://ecom.fenige.pl/client/3ds/finalize`
        // const url = `${fenigeUrl}client/3ds/verify`
        
        var auth = Buffer.from(config.ADAXUser + ':' + config.ADAXPassword).toString('base64');
        // var auth = Buffer.from('ADAX TECH LIMITED:BKRn::6vkka4XZR$').toString('base64');
        const {data} = await axios({
            url,
            method: 'POST',
            headers: {
                Authorization: 'Basic ' + auth,
                ContentType: 'application/json'
            },
            data: {
                pares,
                md
            }
        });

        console.log('fenigePaymentFinalize_RESPONSE' , data);
        return {
            authenticationStatus : data.authenticationStatus,
            cavv : data.cavv,
            eci : data.eci,
            authenticationTime : data.authenticationTime,
        };

    } catch (error) {
        console.log('fenigePaymentFinalize_ERROR' , error);
        if (error.hasOwnProperty('isAxiosError') && error.isAxiosError) {
            console.log('fenigePaymentFinalize_ERROR_RES' , error);
            throw({ code: error.response.status, message: 'unable to process', error: error.response.data })
        }
        throw({ code: 500, error })
    }
}

export function fenigeAddCOFTransaction(
    requestUuid: string,
    // termUuid: string,
    firstName: string,
    lastName: string,
    email: string,
    addressIp: string,
    amount: number,
    currency: string,
    cardNumber: string,
    expiryDate: string,
    cvc2: string,
    autoClear: boolean
    ) {
    return new Promise((resolve, reject) => {
        const postData = {
            "merchantUuid" : config.MerchantUuid,
            // "terminalUuid" : termUuid,
            "requestUuid" : requestUuid,
            "firstName" : firstName,
            "lastName" : lastName,
            "amount" : amount,
            "currency" : currency,
            "cardNumber" : cardNumber,
            "expiryDate" : expiryDate,
            "cvc2" : cvc2,
            "email" : email,
            "addressIp" : addressIp,
            "autoClear" : autoClear
        };
        var url = `${config.FENIGE_BASEURL}/client/payments/cof/initial` ;
        var auth = Buffer.from(config.ADAXUser + ':' + config.ADAXPassword).toString('base64');
        var options = {
            method: 'post',
            body: postData,
            json: true,
            url: url,
            headers: {
                Authorization: 'Basic ' + auth,
                'Content-Type': 'application/json'
            }
        };
        console.log('fenigePayment Data: ', options);
        request(options, function (err: any, res: any, body: any) {
            if (err) {
                console.log('error posting json: ', err);
                // throw err;
                reject(err);
            }
            else {
                
                var headers = res.headers;
                var statusCode = res.statusCode;
                console.log('--------------------------');
                console.log('fenigePayment');
                console.log('--------------------------');
                console.log('headers: ', headers);
                console.log('statusCode: ', statusCode);
                console.log('body: ', body);
                console.log('===========================');
                var data = { 'body' : body, 'statusCode': statusCode };
                resolve(data);
            }
        });
    });
}

export function fenigeAddCOFSubsequentTransaction(
    requestUuid: string,
    cofInitialUuid: string,
    amount: number,
    currency: string,
    autoClear: boolean
    ) {
    return new Promise((resolve, reject) => {
        const postData = {
            "merchantUuid" : config.MerchantUuid,
            "requestUuid" : requestUuid,
            "amount" : amount,
            "currency" : currency,
            "autoClear" : autoClear,
            cofInitialUuid: cofInitialUuid,
        };
        var url = `${config.FENIGE_BASEURL}/client/payments/cof/subsequent` ;
        var auth = Buffer.from(config.ADAXUser + ':' + config.ADAXPassword).toString('base64');
        var options = {
            method: 'post',
            body: postData,
            json: true,
            url: url,
            headers: {
                Authorization: 'Basic ' + auth,
                'Content-Type': 'application/json'
            }
        };
        console.log('fenigePayment Data: ', options);
        request(options, function (err: any, res: any, body: any) {
            if (err) {
                console.log('error posting json: ', err);
                // throw err;
                reject(err);
            }
            else {
                
                var headers = res.headers;
                var statusCode = res.statusCode;
                console.log('--------------------------');
                console.log('fenigePayment');
                console.log('--------------------------');
                console.log('headers: ', headers);
                console.log('statusCode: ', statusCode);
                console.log('body: ', body);
                console.log('===========================');
                var data = { 'body' : body, 'statusCode': statusCode };
                resolve(data);
            }
        });
    });
}


export function fenigeAddCOFOrRecTransaction(
    requestUuid: string,
    termUuid: string,
    firstName: string,
    lastName: string,
    email: string,
    addressIp: string,
    amount: number,
    currency: string,
    cardNumber: string,
    expiryDate: string,
    cvc2: string,
    autoClear: boolean,
    isCOF: boolean,
    ) {
    return new Promise((resolve, reject) => {
        const postData = {
            "merchantUuid" : config.MerchantUuid,
            "terminalUuid" : termUuid,
            "requestUuid" : requestUuid,
            "firstName" : firstName,
            "lastName" : lastName,
            "amount" : amount,
            "currency" : currency,
            "cardNumber" : cardNumber,
            "expiryDate" : expiryDate,
            "cvc2" : cvc2,
            "email" : email,
            "addressIp" : addressIp,
            "autoClear" : autoClear
        };
        var url = isCOF ? `${config.FENIGE_BASEURL}/client/payments/cof/initial` : `${config.FENIGE_BASEURL}/client/payments/recurring/initial` ;
        var auth = Buffer.from(config.ADAXUser + ':' + config.ADAXPassword).toString('base64');
        var options = {
            method: 'post',
            body: postData,
            json: true,
            url: url,
            headers: {
                Authorization: 'Basic ' + auth,
                'Content-Type': 'application/json'
            }
        };
        console.log('fenigePayment Data: ', options);
        request(options, function (err: any, res: any, body: any) {
            if (err) {
                console.log('error posting json: ', err);
                // throw err;
                reject(err);
            }
            else {
                
                var headers = res.headers;
                var statusCode = res.statusCode;
                console.log('--------------------------');
                console.log('fenigePayment');
                console.log('--------------------------');
                console.log('headers: ', headers);
                console.log('statusCode: ', statusCode);
                console.log('body: ', body);
                console.log('===========================');
                var data = { 'body' : body, 'statusCode': statusCode };
                resolve(data);
            }
        });
    });
}


export function fenigeAddCOFOrRecurringSubsequentTransaction(
    requestUuid: string,
    initialUuid: string,
    amount: number,
    currency: string,
    autoClear: boolean,
    isCOF: boolean,
    ) {
    return new Promise((resolve, reject) => {
        const postData = {
            "merchantUuid" : config.MerchantUuid,
            "requestUuid" : requestUuid,
            "amount" : amount,
            "currency" : currency,
            "autoClear" : autoClear,
            [isCOF ? 'cofInitialUuid' : 'recurringInitialUuid' ] : initialUuid,
        };
        var url = isCOF ? `${config.FENIGE_BASEURL}/client/payments/cof/subsequent` :   `${config.FENIGE_BASEURL}/client/payments/recurring/subsequent`;
        var auth = Buffer.from(config.ADAXUser + ':' + config.ADAXPassword).toString('base64');
        var options = {
            method: 'post',
            body: postData,
            json: true,
            url: url,
            headers: {
                Authorization: 'Basic ' + auth,
                'Content-Type': 'application/json'
            }
        };
        console.log('fenigePayment Data: ', options);
        request(options, function (err: any, res: any, body: any) {
            if (err) {
                console.log('error posting json: ', err);
                // throw err;
                reject(err);
            }
            else {
                
                var headers = res.headers;
                var statusCode = res.statusCode;
                console.log('--------------------------');
                console.log('fenigePayment');
                console.log('--------------------------');
                console.log('headers: ', headers);
                console.log('statusCode: ', statusCode);
                console.log('body: ', body);
                console.log('===========================');
                var data = { 'body' : body, 'statusCode': statusCode };
                resolve(data);
            }
        });
    });
}


export async function fenigePaymentRefund(
  requestUuid: string,
  amountToRefund: number,
  ) {
  const postData = {
      merchantUuid : config.MerchantUuid,
      requestUuid,
      amountToRefund
  };
  var url = `${config.FENIGE_BASEURL}/client/payments/refund` ;
  var auth = Buffer.from(config.ADAXUser + ':' + config.ADAXPassword).toString('base64');
  try {
    const { data: { message, refundStatus, responseCode } }: AxiosResponse<{requestUuid: string, message: string, refundStatus: string, responseCode: string}> = await axios.request({
      method: 'POST',
      data: postData,
      url: url,
      headers: {
        Authorization: 'Basic ' + auth,
        'Content-Type': 'application/json'
      }
    });
    return { message, refundStatus, responseCode, httpStatusCode: 200 };
    // return {...fenigeRefundResponse, httpStatusCode: 200};
  } catch (error) {
    console.log('FenigeError', error, 'FenigeError');
    // const PaymentGateWayError = new Error();
    // PaymentGateWayError.name = 'PaymentGateWayError';
    // PaymentGateWayError.message = error.response.data.message;
    // throw PaymentGateWayError;
    return { message: error.response.data.message, refundStatus: error.response.data.refundStatus, responseCode: error.response.data.responseCode, httpStatusCode: 422 };
  }
}