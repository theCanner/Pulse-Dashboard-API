import express from 'express';
import { createCourse, getCourse, getCourseById } from '../db/courses';
import { courseSchema } from '../validations/course.validation';
import { apiResponse } from '../utils/apiResponse';

export const registerCourse = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const { title, courseId, price, description, durationWeeks, isPublished } =
      req.body;

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

    const isExistingCourse = await getCourseById(courseId);

    if (isExistingCourse) {
      return apiResponse({
        res,
        statusCode: 400,
        message: 'Course already exist',
      });
    }

    const course = await createCourse({
      courseId,
      title,
      description,
      price,
      durationWeeks,
      isPublished,
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
