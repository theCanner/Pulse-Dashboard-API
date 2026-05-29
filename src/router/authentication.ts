import express from 'express';
import {
  isMe,
  login,
  logout,
  refreshToken,
  register,
} from '../controller/authentication';

export default (router: express.Router) => {
  router.post('/auth/register', register);
  router.post('/auth/login', login);
  router.post('/auth/logout', logout);
  router.post('/auth/refresh', refreshToken);
  router.get('/auth/isMe', isMe);
};
