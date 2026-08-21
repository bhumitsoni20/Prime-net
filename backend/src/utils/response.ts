import { Response } from 'express';

export const sendSuccess = (res: Response, data: any, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (res: Response, message = 'Server Error', statusCode = 500, errors?: any) => { require('fs').appendFileSync('D:/streamkart/backend/backend_error.log', new Date().toISOString() + ' ' + message + '\n');
  if (statusCode >= 500) console.error("BACKEND ERROR:", message, errors);
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

export const sendPaginated = (
  res: Response,
  data: any[],
  page: number,
  limit: number,
  total: number,
  message = 'Success'
) => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
};
