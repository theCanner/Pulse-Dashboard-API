import express from 'express';
import authentication from './authentication';
import users from './users';
import courses from './courses';
import students from './students';
import enrollments from './enrollments';

const router = express.Router();

export default (): express.Router => {
  authentication(router);
  users(router);
  courses(router);
  students(router);
  enrollments(router);
  return router;
};
