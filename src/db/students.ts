import mongoose, { HydratedDocument, PipelineStage } from 'mongoose';
import { buildId } from '../helpers';
import { generateSequenceId } from './counter';

interface IStudent {
  studentId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  birthDate?: Date;
  status?: 'active' | 'inactive';
}

type StudentFilters = {
  search?: string;
  field?: 'status' | 'studentId' | 'studentName' | 'email';
  page?: number;
  limit?: number;
};

const StudentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    unique: true,
    index: true,
  },
  firstName: String,
  lastName: String,
  email: String,
  phone: String,

  birthDate: Date,

  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
});

// type SearchCondition =
//   | { firstName: RegExp }
//   | { lastName: RegExp }
//   | { status: RegExp }
//   | { studentId: RegExp };

StudentSchema.pre('save', async function (this: HydratedDocument<IStudent>) {
  if (!this.isNew) return;
  if (this.studentId) return;

  const year = new Date().getFullYear();

  const sequence = await generateSequenceId(`student-${year}`);

  this.studentId = buildId('PSN', year, sequence);
});

export const studentModel = mongoose.model('Student', StudentSchema);
export const getStudents = async (filters: StudentFilters = {}) => {
  const page = Math.max(Number(filters.page) || 1, 1);
  const limit = Math.max(Number(filters.limit) || 20, 1);
  const skip = (page - 1) * limit;

  const pipeline: PipelineStage[] = [];

  if (filters.search && filters.field) {
    const regex = new RegExp(filters.search, 'i');

    if (filters.field === 'studentName') {
      pipeline.push({
        $match: {
          $or: [{ firstName: regex }, { lastName: regex }],
        },
      });
    }

    if (filters.field === 'studentId') {
      pipeline.push({
        $match: {
          studentId: regex,
        },
      });
    }

    if (filters.field === 'email') {
      pipeline.push({
        $match: {
          email: regex,
        },
      });
    }

    if (filters.field === 'status') {
      pipeline.push({
        $match: {
          status: regex,
        },
      });
    }
  }

  pipeline.push({
    $project: {
      _id: 1,
      studentId: 1,
      email: 1,
      status: 1,
      studentName: {
        $concat: ['$firstName', ' ', '$lastName'],
      },
    },
  });

  pipeline.push({
    $facet: {
      data: [{ $sort: { _id: -1 } }, { $skip: skip }, { $limit: limit }],
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

  const result = await studentModel.aggregate(pipeline);

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
export const createStudent = (values: Record<string, unknown>) =>
  new studentModel(values).save().then((student) => student.toObject());
export const getStudentById = (studentId: string) =>
  studentModel.findOne({ studentId });
export const deleteStudentById = (studentId: string) =>
  studentModel.findOneAndDelete({ studentId });
