import { Request, Response, NextFunction } from 'express';

// TODO: Implement error handling here returning the right status code and message for the errors
// TODO: Error details for errors with status code 500 should not be shared
// with the callers of the app as this could be a security risk

// TODO: Log the errors

// @ts-ignore
export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  res.status(err.code || 500);
  res.json({ error: err.message, status: err.code || 500 });
}
