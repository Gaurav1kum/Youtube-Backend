import express from "express";
import {
  addComment,
  deleteComment,
  getVideoComments,
  updateComment,
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isCommentOwner } from "../middlewares/comment.middleware.js";

const Router = express.Router({ mergeParams: true });

Router.route("/:videoId")
  .get(getVideoComments)
  .post(verifyJWT, addComment);

Router.route("/c/:commentId")
  .patch([verifyJWT, isCommentOwner], updateComment)
  .delete([verifyJWT, isCommentOwner], deleteComment);

export default Router;
