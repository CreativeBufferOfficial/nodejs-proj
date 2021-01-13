import { Response, Request } from 'express';

export * from './payments';
export * from './crypto-engine';
export * from './stats';
export * from './customer-subuser';

export interface IResponse extends Response {
  userData?: any
}

export interface IRequest extends Request {
  user?: any
}
