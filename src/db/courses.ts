import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,

    price: { type: Number, default: 0 },

    durationWeeks: Number,

    isPublished: { type: Boolean, default: true },

    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

export const courseModel = mongoose.model('Course', CourseSchema);

export const getCourse = () => courseModel.find();
export const createCourse = (values: Record<string, unknown>) =>
  new courseModel(values).save().then((user) => user.toObject());
export const getCourseById = () => courseModel.findById();
export const updateCourse = () => courseModel.findByIdAndUpdate();
export const deleteCourse = () => courseModel.findByIdAndDelete();
