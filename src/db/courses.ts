import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema(
  {
    courseId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: String,

    price: { type: Number, default: 0 },

    durationWeeks: Number,

    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const courseModel = mongoose.model('Course', CourseSchema);

export const getCourse = () => courseModel.find();
export const createCourse = (values: Record<string, unknown>) =>
  new courseModel(values).save().then((course) => course.toObject());
export const getCourseById = (courseId: string) =>
  courseModel.findOne({ courseId });
export const updateCourse = () => courseModel.findByIdAndUpdate();
export const deleteCourse = () => courseModel.findByIdAndDelete();
