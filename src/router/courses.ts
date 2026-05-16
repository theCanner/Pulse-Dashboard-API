import express from 'express';
import { getAllCourse } from '../controller/course';

export default (router: express.Router) => {
  router.get('/courses', getAllCourse);
};
