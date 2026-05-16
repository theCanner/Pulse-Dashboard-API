import express from "express";
import { getCourse } from "../db/courses";

export const getAllCourse = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const courses = await getCourse();

    if (!courses) {
      res.send(400).json({
        message: "Invalid Request",
      });
    }
  } catch (error) {
    console.error(error);
    res.send(400).json({
      message: "Invalid Request",
    });
  }
};
