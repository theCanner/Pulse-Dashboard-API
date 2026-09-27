import express from 'express';
import { createEnrollments, getEnrollment } from '../controller/enrollments';
import { isAuthenticated } from '../middlewares';

export default (router: express.Router) => {
  router.post('/enrollments/create', isAuthenticated, createEnrollments);
  router.get('/enrollments', isAuthenticated, getEnrollment);
};
