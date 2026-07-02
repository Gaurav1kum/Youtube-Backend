import express from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isTweetOwner } from "../middlewares/tweet.middleware.js";
import {
  createTweet,
  getUserTweets,
  updateTweet,
  deleteTweet,
} from "../controllers/tweet.controller.js";

const Router = express.Router();

Router.route("/").post(verifyJWT, createTweet);
Router.route("/user/:userId").get(verifyJWT, getUserTweets);
Router.route("/:tweetId")
  .patch(verifyJWT, isTweetOwner, updateTweet)
  .delete(verifyJWT, isTweetOwner, deleteTweet);

export default Router;
