import express from "express";

import {verifyJWT} from "../middlewares/auth.middleware.js"
import { getLikedVideos, toggleCommetLike, toggleTweetLike, toggleVideoLike } from "../controllers/like.controller.js";
const Router=express.Router({mergeParams:true});
Router.use(verifyJWT);
Router.route("/toggle/v/:videoId").post(toggleVideoLike);
Router.route("/toggle/c/:commentId").post(toggleCommetLike);
Router.route("/toggle/t/:tweetId").post(toggleTweetLike);
Router.route("/videos").get(getLikedVideos);

export default Router