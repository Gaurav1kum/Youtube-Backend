import { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";

import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const isCommentOwner = asyncHandler(async (req, _, next) => {
  const { commentId } = req.params;
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "invalid comment Id");
  }
  const userId = req.user._id;
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(400, "invalid comment id");
  }
  if (!comment.owner.equals(userId)) {
    throw new ApiError(401, "unauthorized no prmission");
  }
  next();
});

export {isCommentOwner}