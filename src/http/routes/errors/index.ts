export * from './error-handler';

export interface IHttpException {
  code: number,
  errorCode?: string,
  message: string,
  errorMessages: object[] | object | null,
}

export class HttpException extends Error implements IHttpException {
  code: number;
  message: string;
  errorCode?: string;
  errorMessages: object[] | object | null;

  constructor ({ code, message, errorMessages, errorCode, statusCode, errors } : { code: number, message: string, errorMessages: object[] | null, errorCode?: string, statusCode?: number, errors?: object }) {
    super(message);
    this.code = code || statusCode as number;
    this.errorCode = errorCode;
    this.message = message;
    this.errorMessages = errorMessages || errors as object;
  }
}