import express, { Request } from 'express'
import { env } from '../config/env'
import jwt from 'jsonwebtoken'


interface JwtPayload {
  userId: string;
  email: string;
}

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export const isOwner = async (req:AuthRequest, res:express.Response, next:express.NextFunction) => {
    try {
        const {id} = req.params
        const currentUserId = req.user?.userId

        if (!currentUserId) {
            return res.sendStatus(403);
        }

        if (currentUserId != id) {
            return res.sendStatus(403);
        }

        next();
    }catch (error){
        console.error(error);
        return res.sendStatus(400);
    }
 }

export const isAuthenticated = async (req:AuthRequest, res:express.Response, next:express.NextFunction) => {
    try {
        const token = req.cookies[env.ACCESS_COOKIE]
        if (!token){
           return res.sendStatus(403);
        }

        if (!token){
           return res.sendStatus(403);
        }
        const decoded = jwt.verify(
            token,
            env.ACCESS_SECRET
        ) as JwtPayload

        req.user = decoded
        return next();
    } catch (error){
        console.log(error);
        return res.sendStatus(400);
    }
}

