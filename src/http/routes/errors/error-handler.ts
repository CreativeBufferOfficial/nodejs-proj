import { Request, Response, NextFunction } from 'express';
import { IHttpException } from '.';

export const errorHandler = (err: IHttpException, _req: Request, res: Response, _next: NextFunction) => {
  const code = err.code || 500;
  const errorCode = err.errorCode || err.code || 500;
  const message = err.message || 'Something went wrong.';
  const errorMessages = err.errorMessages || [];
  res.status(code).json({ code, errorCode, message, ...(errorMessages && { errorMessages }) });
}