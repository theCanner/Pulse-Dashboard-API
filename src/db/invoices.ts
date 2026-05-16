import mongoose from "mongoose";

const InvoiceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  enrollment: { type: mongoose.Schema.Types.ObjectId, ref: "Enrollment" },

  amount: { type: Number, required: true },

  status: {
    type: String,
    enum: ["pending", "paid", "overdue", "cancelled"],
    default: "pending",
  },

  dueDate: Date,
  paidAt: Date,

  invoiceNumber: { type: String, unique: true },
}, { timestamps: true });