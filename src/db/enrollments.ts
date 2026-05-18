import mongoose, { PipelineStage } from 'mongoose';

type EnrollmentFilters = {
  search?: string;
  status?: 'active' | 'completed' | 'dropped';
  startDate?: string;
  endDate?: string;
};

type EnrollmentMatch = {
  status?: 'active' | 'completed' | 'dropped';
  enrolledAt?: {
    $gte?: Date;
    $lte?: Date;
  };
};

const EnrollmentSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.ObjectId, ref: 'Student', required: true },
    course: { type: mongoose.Schema.ObjectId, ref: 'Course', required: true },
    status: {
      type: String,
      enum: ['active', 'completed', 'dropped'],
      default: 'active',
    },
    progress: { type: Number, default: 0 },
    enrolledAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export const enrollmentModel = mongoose.model('Enrollment', EnrollmentSchema);

export const createEnrollment = (values: Record<string, unknown>) =>
  new enrollmentModel(values).save().then((e) => e.toObject());

export const getEnrollments = async (filters: EnrollmentFilters) => {
  const pipeline: PipelineStage[] = [];

  // JOIN student
  pipeline.push({
    $lookup: {
      from: 'students',
      localField: 'student',
      foreignField: '_id',
      as: 'student',
    },
  });

  pipeline.push({ $unwind: '$student' });

  // JOIN course
  pipeline.push({
    $lookup: {
      from: 'courses',
      localField: 'course',
      foreignField: '_id',
      as: 'course',
    },
  });

  pipeline.push({ $unwind: '$course' });

  const match: EnrollmentMatch = {};

  // STATUS FILTER
  if (filters.status) {
    match.status = filters.status;
  }

  // DATE FILTER
  if (filters.startDate || filters.endDate) {
    match.enrolledAt = {};

    if (filters.startDate) {
      match.enrolledAt.$gte = new Date(filters.startDate);
    }

    if (filters.endDate) {
      match.enrolledAt.$lte = new Date(filters.endDate);
    }
  }

  // APPLY MATCH FILTERS
  if (Object.keys(match).length > 0) {
    pipeline.push({ $match: match });
  }

  // SEARCH (student name + course title)
  if (filters.search) {
    const regex = new RegExp(filters.search, 'i');

    pipeline.push({
      $match: {
        $or: [
          { 'student.firstName': regex },
          { 'student.lastName': regex },
          { 'course.title': regex },
        ],
      },
    });
  }

  return enrollmentModel.aggregate(pipeline);
};
