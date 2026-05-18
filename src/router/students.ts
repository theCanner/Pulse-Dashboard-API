import express from 'express';

import { isAdmin, isAuthenticated } from '../middlewares';
import {
  deleteStudent,
  getAllStudents,
  registerStudent,
  updateStudent,
} from '../controller/students';

export default (router: express.Router) => {
  router.get('/students', getAllStudents);
  router.post('/students/create', isAuthenticated, isAdmin, registerStudent);
  router.patch('/students/update/:id', isAuthenticated, isAdmin, updateStudent);
  router.delete(
    '/students/delete/:id',
    isAuthenticated,
    isAdmin,
    deleteStudent,
  );
};
