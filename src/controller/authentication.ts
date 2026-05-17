import express from 'express';
import { createUser, getUserByEmail, getUserById } from '../db/users';
import bcrypt from 'bcrypt';
import { authentication } from '../helpers';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { env } from '../config/env';
import { UserSchema } from '../validations/user.validation';
import { apiResponse } from '../utils/apiResponse';
dotenv.config();

interface JwtPayload {
  userId: string;
  email: string;
}
export const login = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return apiResponse({
        res,
        statusCode: 400,
        message: 'Invalid Request',
      });
    }
    const user = await getUserByEmail(email).select('+authentication.password');

    if (!user) {
      return apiResponse({
        res,
        statusCode: 400,
        message: 'User Not Existed',
      });
    }

    if (!user.authentication?.password) {
      return apiResponse({
        res,
        statusCode: 400,
        message: 'Invalid Credentials',
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.authentication.password,
    );

    if (!isMatch) {
      return apiResponse({
        res,
        statusCode: 403,
        message: 'No Account Match',
      });
    }

    const accessToken = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
      },
      env.ACCESS_SECRET,
      {
        expiresIn: '5m',
      },
    );

    const refreshToken = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
      },
      env.REFRESH_SECRET,
      {
        expiresIn: '7d',
      },
    );

    res.cookie(env.ACCESS_COOKIE, accessToken, {
      httpOnly: true,
      secure: env.ENV === 'prod',
      sameSite: 'lax',
      path: '/',
    });

    res.cookie(env.REFRESH_COOKIE, refreshToken, {
      httpOnly: true,
      secure: env.ENV === 'prod',
      sameSite: 'lax',
      path: '/',
    });
    user.refreshToken = refreshToken;
    await user.save();

    return apiResponse({
      res,
      statusCode: 200,
      message: 'login successful',
      data: {
        ...user.toJSON(),
      },
    });
  } catch (error) {
    console.error(error);
    return apiResponse({
      res,
      statusCode: 400,
      message: 'Invalid Request',
    });
  }
};

export const register = async (req: express.Request, res: express.Response) => {
  try {
    const { username, email, role, password } = req.body;

    const parsed = UserSchema.safeParse(req.body);

    if (!parsed.success) {
      return apiResponse({
        res,
        statusCode: 400,
        message: 'Validation Error',
        errors: parsed.error.issues.map((issue) => issue.message),
      });
    }

    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      return apiResponse({
        res,
        statusCode: 400,
        message: 'User already exist',
      });
    }
    const hash = await authentication(password);
    const user = await createUser({
      username,
      email,
      role,
      authentication: {
        password: hash,
      },
    });

    return apiResponse({
      res,
      statusCode: 200,
      message: 'Registered Succesfully',
      data: user,
    });
  } catch (error) {
    console.log(error);
    return apiResponse({
      res,
      statusCode: 400,
      message: 'Invalid Request',
    });
  }
};

export const refreshToken = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const token = req.cookies[env.REFRESH_COOKIE];

    if (!token) {
      return apiResponse({
        res,
        statusCode: 400,
        message: 'No Token',
      });
    }

    const decode = jwt.verify(token, env.REFRESH_SECRET) as JwtPayload;

    const user = await getUserById(decode.userId).select('refreshToken');
    if (!user) {
      return apiResponse({
        res,
        statusCode: 400,
        message: 'User not found',
      });
    }
    if (user.refreshToken !== token) {
      return apiResponse({
        res,
        statusCode: 400,
        message: 'Invalid Token',
      });
    }

    const newAccessToken = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
      },
      env.ACCESS_SECRET,
      { expiresIn: '5m' },
    );

    res.cookie(env.ACCESS_COOKIE, newAccessToken, {
      httpOnly: true,
      secure: env.ENV === 'prod',
      sameSite: 'lax',
      path: '/',
    });
    return apiResponse({
      res,
      statusCode: 200,
      message: 'token refreshed',
    });
  } catch (error) {
    console.error(error);
    return apiResponse({
      res,
      statusCode: 400,
      message: 'Invalid Request',
    });
  }
};

const clearCache = (res: express.Response) => {
  res.clearCookie(env.ACCESS_COOKIE, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.ENV === 'prod',
    path: '/',
  });

  res.clearCookie(env.REFRESH_COOKIE, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.ENV === 'prod',
    path: '/',
  });

  return apiResponse({
    res,
    statusCode: 200,
    message: 'Logout succesfully',
  });
};

export const logout = async (req: express.Request, res: express.Response) => {
  try {
    const refreshToken = req.cookies[env.REFRESH_COOKIE];

    if (!refreshToken) {
      return clearCache(res);
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(refreshToken, env.REFRESH_SECRET) as JwtPayload;
    } catch {
      return clearCache(res);
    }

    const user = await getUserById(decoded.userId).select('+refreshToken');
    if (!user) {
      return apiResponse({
        res,
        statusCode: 403,
        message: 'User not found.',
      });
    }
    user.refreshToken = null;
    await user.save();
    return clearCache(res);
  } catch (error) {
    console.log(error);
    return clearCache(res);
  }
};
