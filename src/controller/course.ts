import express from 'express';
import {
  createCourse,
  deleteCourseById,
  getCourse,
  getCourseById,
} from '../db/courses';
import {
  courseSchema,
  updateCourseSchema,
} from '../validations/course.validation';
import { apiResponse } from '../utils/apiResponse';

export const registerCourse = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const parsed = courseSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.issues.map((issue) => issue.message);
      return apiResponse({
        res,
        statusCode: 400,
        message: 'Validation Error',
        errors,
      });
    }

    const courseParsed = parsed.data;

    const isExistingCourse = await getCourseById(courseParsed.courseId);

    if (isExistingCourse) {
      return apiResponse({
        res,
        statusCode: 400,
        message: 'Course already exist',
      });
    }

    const course = await createCourse({
      ...courseParsed,
    });

    return apiResponse({
      res,
      data: course,
      statusCode: 200,
      message: 'Course Succesfully Added',
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

export const getAllCourse = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const courses = await getCourse();

    if (!courses) {
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
      data: { courses },
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

export const updateCourse = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const { id } = req.params;
    const parsed = updateCourseSchema.safeParse(req.body);

    if (!id) {
      return apiResponse({
        res,
        statusCode: 400,
        message: 'Invalid Id',
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

    const course = await getCourseById(id as string);

    if (!course) {
      return apiResponse({
        res,
        statusCode: 403,
        message: 'Course not found.',
      });
    }

    Object.assign(course, parsed.data);
    await course.save();
    return apiResponse({
      res,
      statusCode: 200,
      message: 'Courses Updated',
      data: course,
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

export const deleteCourse = async (
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

    const course = await getCourseById(id as string);

    if (!course) {
      return apiResponse({
        res,
        statusCode: 400,
        message: 'Course not exist',
      });
    }

    await deleteCourseById(id as string);
    return apiResponse({
      res,
      statusCode: 200,
      message: 'Course succesfuly deleted',
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
