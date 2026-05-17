import express from 'express';
import { createCourse, getCourse, getCourseById } from '../db/courses';
import { courseSchema } from '../validations/course.validation';

export const registerCourse = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const { title, courseId, price, description, durationWeeks, isPublished } =
      req.body;

    const parsed = courseSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: 'Validation Error',
        errors: parsed.error.issues.map((issue) => issue.message),
      });
    }

    const isExistingCourse = await getCourseById(courseId);

    if (isExistingCourse) {
      return res.status(400).json({
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

    return res.status(200).json({
      message: 'Course Added',
      data: {
        course,
      },
    });
  } catch (error) {
    console.error(error);
    res.send(400).json({
      status: 400,
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
      res.status(400).json({
        message: 'Invalid Request',
      });
    }

    res.status(200).json({
      status: 200,
      message: 'Success Retrieve Sources',
      data: { courses },
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      message: 'Invalid Request',
    });
  }
};
