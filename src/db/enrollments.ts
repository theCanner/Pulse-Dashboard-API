import mongoose from "mongoose";

const EnrollmentSchema  = new mongoose.Schema({
     student: {type:mongoose.Schema.ObjectId , ref:"Student" , required:true },
     
     course : {type:mongoose.Schema.ObjectId , ref: "Course" , required :true },
     
     status: {
        type: String,
        enum: ["active", "completed", "dropped"],
        default: "active",
    },

    progress: { type: Number, default: 0 }, // 0–100%

    enrolledAt: { type: Date, default: Date.now },
    }, { timestamps: true });