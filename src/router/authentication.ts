import express from 'express'
import { login, refreshToken, register } from '../controller/authentication';
import { isAuthenticated, isOwner } from '../middlewares';

export default (router:express.Router) => {
    router.post('/auth/register',register);
    router.post('/auth/login',login);
    router.post('/auth/refresh',refreshToken);
}