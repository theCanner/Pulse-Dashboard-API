import express from 'express';
import { createCourse, getCourse, getCourseById } from '../db/courses';

export const registerCourse = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const { title, courseId, price, durationWeeks, isPublished } = req.body;
    if (
      !title ||
      !courseId ||
      price == null ||
      durationWeeks == null ||
      isPublished == null
    ) {
      return res.status(400).json({
        message: 'Invalid Request',
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
