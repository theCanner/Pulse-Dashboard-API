import mongoose, { HydratedDocument } from 'mongoose';
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

StudentSchema.pre('save', async function (this: HydratedDocument<IStudent>) {
  if (!this.isNew) return;
  if (this.studentId) return;

  const year = new Date().getFullYear();

  const sequence = await generateSequenceId(`student-${year}`);

  this.studentId = buildId('PSN', year, sequence);
});

export const studentModel = mongoose.model('Student', StudentSchema);
export const getStudents = () => studentModel.find();
export const createStudent = (values: Record<string, unknown>) =>
  new studentModel(values).save().then((student) => student.toObject());
export const getStudentById = (studentId: string) =>
  studentModel.findOne({ studentId });
export const deleteStudentById = (studentId: string) =>
  studentModel.findOneAndDelete({ studentId });
