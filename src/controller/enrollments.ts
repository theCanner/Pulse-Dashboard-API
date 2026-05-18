import express from 'express';
import { apiResponse } from '../utils/apiResponse';
import { EnrollmentSchema } from '../validations/enrollments.validation';
import { createEnrollment, getEnrollments } from '../db/enrollments';

export const createEnrollments = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const parsed = EnrollmentSchema.safeParse(req.body);

    if (!parsed.success) {
      const errors = parsed.error.issues.map((issue) => issue.message);
      return apiResponse({
        res,
        statusCode: 400,
        message: 'Validation Error',
        errors,
      });
    }

    const parsedEnrollment = parsed.data;

    await createEnrollment({
      ...parsedEnrollment,
    });

    return apiResponse({
      res,
      statusCode: 200,
      message: 'Enrollment Created',
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

export const getEnrollment = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const { search, status, startDate, endDate } = req.query;

    const filters = {
      search: search as string | undefined,
      status: status as 'active' | 'completed' | 'dropped' | undefined,
      startDate: startDate as string | undefined,
      endDate: endDate as string | undefined,
    };

    const enrollments = await getEnrollments(filters);

    return res.json({
      message: 'Enrollments fetched successfully',
      data: enrollments,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Server error',
    });
  }
};
