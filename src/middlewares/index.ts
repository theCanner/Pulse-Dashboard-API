import express, { Request } from 'express';
import { env } from '../config/env';
import jwt, { TokenExpiredError } from 'jsonwebtoken';
import { apiResponse } from '../utils/apiResponse';

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const isOwner = async (
  req: AuthRequest,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user?.userId;

    if (!currentUserId) {
      return apiResponse({
        res,
        statusCode: 404,
        message: 'User not found',
      });
    }

    if (currentUserId != id) {
      return apiResponse({
        res,
        statusCode: 404,
        message: 'Invalid User Id',
      });
    }

    next();
  } catch (error) {
    console.error(error);
    return apiResponse({
      res,
      statusCode: 401,
      message: 'Unauthorized',
    });
  }
};

export const isAuthenticated = async (
  req: AuthRequest,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    const token = req.cookies[env.ACCESS_COOKIE];
    if (!token) {
      return apiResponse({
        res,
        statusCode: 401,
        message: 'No Token',
      });
    }
    const decoded = jwt.verify(token, env.ACCESS_SECRET) as JwtPayload;
    req.user = decoded;
    return next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return apiResponse({
        res,
        statusCode: 401,
        message: 'Token Expired',
      });
    }

    return apiResponse({
      res,
      statusCode: 401,
      message: 'Invalid expired',
    });
  }
};

export const isAdmin = async (
  req: AuthRequest,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    if (!req.user) {
      return apiResponse({
        res,
        statusCode: 401,
        message: 'Unauthorized',
      });
    }
    if (req.user.role !== 'admin') {
      return apiResponse({
        res,
        statusCode: 403,
        message: 'Invalid Access',
      });
    }
    return next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return apiResponse({
        res,
        statusCode: 401,
        message: 'Token Expired',
      });
    }

    return apiResponse({
      res,
      statusCode: 401,
      message: 'Invalid expired',
    });
  }
};
