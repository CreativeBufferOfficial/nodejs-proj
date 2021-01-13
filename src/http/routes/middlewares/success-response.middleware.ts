import { Request, Response, NextFunction } from 'express';


interface IResponse extends Response {
  userData?: any
}

export const successResponseMiddleware = (_req: Request, res: IResponse, next: NextFunction) => {
  if (res.userData) {
    const { statusCode, ...data } = res.userData
    return res.status(statusCode || 200).json(data);
  }
  next();
}