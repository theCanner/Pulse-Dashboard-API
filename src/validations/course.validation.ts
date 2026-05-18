import * as z from 'zod';

export const CourseSchema = z.object({
  title: z.string().min(1, 'Title is required'),

  courseId: z.string().min(1, 'Course ID is required'),

  price: z.number().nonnegative('Price must be 0 or more'),

  durationWeeks: z.number().int().positive('Duration must be positive'),

  isPublished: z.boolean(),
});

export const UpdateCourseSchema = CourseSchema.partial();
