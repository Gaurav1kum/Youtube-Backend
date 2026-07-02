import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    methods: ["PUT", "GET", "DELETE", "POST", "PATCH"],
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//routes import
import userRouter from "./routes/user.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js"
import videoRouter from "./routes/video.routes.js"
import  playlistRouter from "./routes/playlist.routes.js"
import commentRouter from "./routes/comment.routes.js";
import likeRouter from "./routes/like.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import { ApiError } from "./utils/ApiError.js";

//routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/subscriptions",subscriptionRouter);
app.use("/api/v1/videos",videoRouter);
app.use("/api/v1/playlists",playlistRouter);
app.use("/api/v1/comments",commentRouter);
app.use("/api/v1/likes",likeRouter);
app.use("/api/v1/tweets",tweetRouter);
app.use("*",async(req,res,next)=>{
  const message=`${req.originalUrl} and ${req.method} method does not exists`
    const err= new ApiError(400,message);
    next(err);
})
//error middleware to handle error
app.use((err, req, res, next) => {
  console.log(err.stack);
  const { statusCode = 500, message = "Some went wrong" } = err;
  res.status(statusCode).json({
    statusCode: statusCode,
    success: false,
    message: message,
  });
});
export default app;
