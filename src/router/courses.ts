import express from 'express';
import { getAllCourse, registerCourse } from '../controller/course';

export default (router: express.Router) => {
  router.post('/courses/create', registerCourse);
  router.get('/courses', getAllCourse);
};
