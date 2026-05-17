import { Response } from 'express';

type ApiResponseParams = {
  res: Response;
  statusCode: number;
  message: string;
  data?: unknown;
  errors?: unknown;
};

export const apiResponse = ({
  res,
  statusCode,
  message,
  data = null,
  errors = null,
}: ApiResponseParams) => {
  return res.status(statusCode).json({
    status: statusCode,
    message,
    data,
    errors,
  });
};
