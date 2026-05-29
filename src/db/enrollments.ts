import mongoose, { HydratedDocument, PipelineStage } from 'mongoose';
import { generateSequenceId } from './counter';
import { buildId } from '../helpers';

type EnrollmentFilters = {
  search?: string;
  field?:
    | 'studentName'
    | 'courseTitle'
    | 'status'
    | 'enrollmentId'
    | 'course'
    | 'enrollmentid'
    | 'student';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
};

interface IEnrollment {
  enrollmentId: string;
  student?: string;
  course?: string;
  status?: 'active' | 'completed' | 'dropped';
  progress?: number;
  enrolledAt?: Date;
}

type EnrollmentMatch = {
  enrolledAt?: {
    $gte?: Date;
    $lte?: Date;
  };
};

type SearchCondition =
  | { 'student.firstName': RegExp }
  | { 'student.lastName': RegExp }
  | { 'course.title': RegExp }
  | { status: RegExp }
  | { enrollmentId: RegExp };

const EnrollmentSchema = new mongoose.Schema(
  {
    enrollmentId: {
      type: String,
      unique: true,
      index: true,
    },
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

EnrollmentSchema.pre(
  'save',
  async function (this: HydratedDocument<IEnrollment>) {
    if (!this.isNew) return;
    if (this.enrollmentId) return;

    const year = new Date().getFullYear();

    const sequence = await generateSequenceId(`enrollment-${year}`);

    this.enrollmentId = buildId('ENR', year, sequence);
  },
);

export const enrollmentModel = mongoose.model('Enrollment', EnrollmentSchema);

export const createEnrollment = (values: Record<string, unknown>) =>
  new enrollmentModel(values).save().then((e) => e.toObject());

export const getEnrollments = async (filters: EnrollmentFilters = {}) => {
  const page = Math.max(Number(filters.page) || 1, 1);
  const limit = Math.max(Number(filters.limit) || 20, 1);
  const skip = (page - 1) * limit;
  const pipeline: PipelineStage[] = [];
  pipeline.push({
    $lookup: {
      from: 'students',
      let: { studentId: '$student' },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ['$_id', '$$studentId'] },
          },
        },
        {
          $project: {
            _id: 0,
            firstName: 1,
            lastName: 1,
          },
        },
      ],
      as: 'student',
    },
  });

  pipeline.push({ $unwind: '$student' });

  pipeline.push({
    $lookup: {
      from: 'courses',
      let: { courseId: '$course' },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ['$_id', '$$courseId'] },
          },
        },
        {
          $project: {
            _id: 0,
            title: 1,
          },
        },
      ],
      as: 'course',
    },
  });

  pipeline.push({ $unwind: '$course' });

  const match: EnrollmentMatch = {};

  if (filters.startDate || filters.endDate) {
    match.enrolledAt = {};

    if (filters.startDate) {
      match.enrolledAt.$gte = new Date(filters.startDate);
    }

    if (filters.endDate) {
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      match.enrolledAt.$lte = end;
    }
  }

  if (Object.keys(match).length > 0) {
    pipeline.push({ $match: match });
  }
  console.log(filters);
  if (filters.search && filters.field) {
    const regex = new RegExp(filters.search, 'i');

    let conditions: SearchCondition[] = [];

    if (filters.field === 'studentName' || filters.field === 'student') {
      conditions = [
        { 'student.firstName': regex },
        { 'student.lastName': regex },
      ];
    }

    if (filters.field === 'enrollmentId' || filters.field === 'enrollmentid') {
      conditions = [{ enrollmentId: regex }];
    }

    if (filters.field === 'courseTitle' || filters.field === 'course') {
      conditions = [{ 'course.title': regex }];
    }

    if (filters.field === 'status') {
      conditions = [{ status: regex }];
    }

    if (conditions.length > 0) {
      pipeline.push({
        $match: { $or: conditions },
      });
    }
  }

  pipeline.push({
    $project: {
      _id: 1,
      enrollmentId: 1,
      student: {
        $concat: ['$student.firstName', ' ', '$student.lastName'],
      },
      course: '$course.title',
      status: 1,
      progress: 1,
      enrolledAt: 1,
      createdAt: 1,
      updatedAt: 1,
    },
  });

  pipeline.push({
    $facet: {
      data: [{ $sort: { createdAt: -1 } }, { $skip: skip }, { $limit: limit }],
      metadata: [{ $count: 'totalDocuments' }],
    },
  });

  pipeline.push({
    $project: {
      data: 1,
      page: { $literal: page },
      limit: { $literal: limit },
      totalDocuments: {
        $ifNull: [{ $arrayElemAt: ['$metadata.totalDocuments', 0] }, 0],
      },
      totalPages: {
        $ceil: {
          $divide: [
            {
              $ifNull: [{ $arrayElemAt: ['$metadata.totalDocuments', 0] }, 0],
            },
            limit,
          ],
        },
      },
    },
  });

  const result = await enrollmentModel.aggregate(pipeline);
  return (
    result[0] ?? {
      data: [],
      page,
      limit,
      totalDocuments: 0,
      totalPages: 0,
    }
  );
};
