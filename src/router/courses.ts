import express from 'express';
import {
  deleteCourse,
  getAllCourse,
  registerCourse,
  updateCourse,
} from '../controller/course';
import { isAdmin, isAuthenticated } from '../middlewares';

export default (router: express.Router) => {
  router.get('/courses', getAllCourse);
  router.post('/courses/create', isAuthenticated, isAdmin, registerCourse);
  router.patch('/courses/update/:id', isAuthenticated, isAdmin, updateCourse);
  router.delete('/courses/delete/:id', isAuthenticated, isAdmin, deleteCourse);
};
