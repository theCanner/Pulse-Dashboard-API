import express from 'express';
import authentication from './authentication';
import users from './users';
import courses from './courses';

const router = express.Router();

export default (): express.Router => {
  authentication(router);
  users(router);
  courses(router);
  return router;
};
