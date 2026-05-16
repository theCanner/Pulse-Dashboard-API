import dotenv from "dotenv";
dotenv.config();

export const env = {
  ACCESS_COOKIE: process.env.ACCESS_COOKIE_AUTH as string,
  REFRESH_COOKIE: process.env.REFRESH_COOKIE_AUTH as string,
  MONGO_URL: process.env.MONGO_URL as string,
  ACCESS_SECRET: process.env.ACCESS_SECRET as string,
  REFRESH_SECRET: process.env.REFRESH_SECRET as string,
  ENV: process.env.NODE_ENV as string,
};
