import express from 'express';
import { apiResponse } from '../utils/apiResponse';
import {
  StudentSchema,
  UpdateStudentSchema,
} from '../validations/students.validation';
import {
  createStudent,
  deleteStudentById,
  getStudentById,
  getStudents,
} from '../db/students';

export const registerStudent = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const parsed = StudentSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.issues.map((issue) => issue.message);
      return apiResponse({
        res,
        statusCode: 400,
        message: 'Validation Error',
        errors,
      });
    }

    const studentParsed = parsed.data;
    const student = await createStudent({
      ...studentParsed,
    });

    return apiResponse({
      res,
      data: student,
      statusCode: 200,
      message: 'Student Succesfully Added',
    });
  } catch (error) {
    console.error(error);
    return apiResponse({
      res,
      statusCode: 400,
      message: 'Invalid Request',
    });
  }
};

export const getAllStudents = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const students = await getStudents();

    if (!students) {
      return apiResponse({
        res,
        statusCode: 400,
        message: 'No available courses',
      });
    }
    return apiResponse({
      res,
      statusCode: 200,
      message: 'Courses succesfully retrieved.',
      data: { students },
    });
  } catch (error) {
    console.error(error);
    return apiResponse({
      res,
      statusCode: 400,
      message: 'Invalid Request',
    });
  }
};

export const updateStudent = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const { id } = req.params;
    const parsed = UpdateStudentSchema.safeParse(req.body);

    if (!id) {
      return apiResponse({
        res,
        statusCode: 400,
        message: 'Invalid Student Id',
      });
    }
    if (!parsed.success) {
      const errors = parsed.error.issues.map((issue) => issue.message);
      return apiResponse({
        res,
        statusCode: 400,
        errors: errors,
        message: 'Validation Error',
      });
    }

    const student = await getStudentById(id as string);

    if (!student) {
      return apiResponse({
        res,
        statusCode: 403,
        message: 'Course not found.',
      });
    }

    Object.assign(student, parsed.data);
    await student.save();
    return apiResponse({
      res,
      statusCode: 200,
      message: 'Student Updated',
      data: student,
    });
  } catch (error) {
    console.error(error);
    return apiResponse({
      res,
      statusCode: 400,
      message: 'Invalid Request',
    });
  }
};

export const deleteStudent = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return apiResponse({
        res,
        statusCode: 400,
        message: 'Invalid course ID',
      });
    }

    const student = await getStudentById(id as string);

    if (!student) {
      return apiResponse({
        res,
        statusCode: 400,
        message: 'Course not exist',
      });
    }

    await deleteStudentById(id as string);
    return apiResponse({
      res,
      statusCode: 200,
      message: 'Student succesfuly deleted',
    });
  } catch (error) {
    console.error(error);
    return apiResponse({
      res,
      statusCode: 400,
      message: 'Invalid Request',
    });
  }
};
