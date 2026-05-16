import express from "express";
import http from "http";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";
import mongoose from "mongoose";
import { env } from "./config/env";
import router from "./router";

const app = express();

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use(
  cors({
    credentials: true,
  }),
);

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());

const server = http.createServer(app);

server.listen(8282, () => {
  console.log(`Express is running in 8282 Server`);
});

mongoose
  .connect(env.MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.use("/", router());
