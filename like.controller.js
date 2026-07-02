import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "invalid video id");
  }
  const userId = req.user._id;
  const like = await Like.findOne({ video: videoId, likedBy: userId });
  if (!like) {
    await Like.create({
      video: videoId,
      likedBy: userId,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "video liked successfully"));
  } else {
    await like.deleteOne();
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "video unlike successfully"));
  }
});

const toggleCommetLike = asyncHandler(async (req, res) => {
  const { commentId } = req.body;
  if (!commentId) {
    throw new ApiError(400, "invalid comment id");
  }
  const userId = req.user._id;
  const like = Like.findOne({ comment: commentId, likedBy: userId });
  if (!like) {
    await Like.create({
      comment: commentId,
      likedBy: userId,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "commet liked successfully"));
  } else {
    await like.deleteOne();
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "comment unlike successfully"));
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!tweetId) {
    throw new ApiError(400, "invalid comment id");
  }
  const userId = req.user._id;
  const like = await Like.findOne({ tweet: tweetId, likedBy: userId });
  if (!like) {
    await Like.create({
      tweet: tweetId,
      likedBy: userId,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "tweet liked successfully"));
  } else {
    await like.deleteOne();
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "tweet unlike successfully"));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  let userId = req.user._id;
  userId = new mongoose.Types.ObjectId(userId);
  const likeVideos = await Like.aggregate([
    {
      $match: {
        likedBy: userId,
        video: { $exists: true },
      },
    },
    { $skip: 0 },
    { $limit: 2 },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "video",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                    coverImage: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
          {
            $lookup: {
              from: "likes",
              localField: "_id",
              foreignField: "video",
              as: "totalLikes",
            },
          },
          {
            $addFields: {
              totalLikes: { $size: "$totalLikes" },
            },
          },
          {
            $project: {
              __v: 0,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        video: {
          $first: "$video",
        },
      },
    },
    { $project: { video: 1, _id: 0 } },
    { $replaceRoot: { newRoot: "$video" } },
  ]);
  console.log(likeVideos);
  res
    .status(200)
    .json(new ApiResponse(200, likeVideos, "videos get successfully"));
});
export { toggleVideoLike, toggleCommetLike, toggleTweetLike, getLikedVideos };
