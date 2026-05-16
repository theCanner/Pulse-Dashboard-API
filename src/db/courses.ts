import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,

  price: { type: Number, default: 0 },

  durationWeeks: Number,

  isPublished: { type: Boolean, default: true },

  instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });