import express from 'express';
import { createUser, getUserByEmail, getUserById } from '../db/users';
import bcrypt from 'bcrypt';
import { authentication } from '../helpers';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { env } from '../config/env';
dotenv.config();

interface JwtPayload {
  userId: string;
  email: string;
}
export const login = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.sendStatus(400);
    }
    const user = await getUserByEmail(email).select('+authentication.password');

    if (!user) {
      return res.sendStatus(400);
    }

    if (!user.authentication?.password) {
      return res.sendStatus(400);
    }

    const isMatch = await bcrypt.compare(
      password,
      user.authentication.password,
    );

    if (!isMatch) {
      return res.sendStatus(403);
    }

    const accessToken = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
      },
      env.ACCESS_SECRET,
      {
        expiresIn: '10s',
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
    return res.status(200).json({
      status: 200,
      message: 'login successful',
      data: {
        ...user.toJSON(),
      },
    });
  } catch (error) {
    console.error(error);
    return res.sendStatus(400);
  }
};

export const register = async (req: express.Request, res: express.Response) => {
  try {
    const { username, email, role, password } = req.body;
    if (!username || !email || !password || !role) {
      return res.sendStatus(400);
    }

    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      return res.sendStatus(400);
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
    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

export const refreshToken = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const token = req.cookies[env.REFRESH_COOKIE];

    if (!token) {
      return res.sendStatus(400);
    }

    const decode = jwt.verify(token, env.REFRESH_SECRET) as JwtPayload;

    const user = await getUserById(decode.userId).select('refreshToken');
    if (!user) {
      return res.sendStatus(400);
    }
    if (user.refreshToken !== token) {
      return res.sendStatus(400);
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
    return res.sendStatus(200);
  } catch (error) {
    console.error(error);
    return res.sendStatus(400);
  }
};
