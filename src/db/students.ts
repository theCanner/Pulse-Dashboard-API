import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema({
  studentNumber: { type: String, unique: true, required: true },

  firstName: String,
  lastName: String,
  email: String,
  phone: String,

  birthDate: Date,

  status: {
    type: String,
    enum: ["active", "inactive", "graduated"],
    default: "active",
  },
});