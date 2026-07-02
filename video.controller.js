import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {
  uploadOnCloudinary,
  updateOnCloudinary,
  deleteOnCloudinary,
} from "../utils/cloudinary.js";
import fs from "fs";
import { ApiResponse } from "../utils/ApiResponse.js";

const getAllVideos = asyncHandler(async (req, res) => {});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const userId = req.user?._id;
  const localThumnailPath = req.files.thumnail?.[0]?.path;
  const localVideoPath = req.files.videoFile?.[0]?.path;
  if (!title || !description || !localThumnailPath || !localVideoPath) {
    localThumnailPath && fs.unlinkSync(localThumnailPath);
    localVideoPath && fs.unlinkSync(localVideoPath);
    throw new ApiError(400, "All fields are required!");
  }
  try {
    const videoFile = await uploadOnCloudinary(localVideoPath);
    const thumnail = await uploadOnCloudinary(localThumnailPath);
    if (!videoFile) {
      throw new ApiError(400, "Error occure while uploading video in bucket");
    }
    if (!thumnail) {
      throw new ApiError(
        400,
        "Error occure while uploading thumbnail in bucket"
      );
    }
    const videoRespone = await Video.create({
      title: title,
      description: description,
      owner: userId,
      videoFile: {
        url: videoFile.playback_url,
        public_id: videoFile.public_id,
      },
      thumnail: {
        url: thumnail.url,
        public_id: thumnail.public_id,
      },
      duration: videoFile.duration,
    });
    return res
      .status(201)
      .json(new ApiResponse(201, videoRespone, "Video upload successfully"));
  } catch (error) {
    console.log(error);
    throw new ApiError(400, "Some error occure while uploading video");
  }
});

const getVideoById = asyncHandler(async (req, res) => {
  let { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "invalid videoId");
  }
  videoId = new mongoose.Types.ObjectId(videoId);
  const video = await Video.aggregate([
    {
      $match: {
        _id: videoId,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $lookup: {
              from: "subscriptions",
              localField: "_id",
              foreignField: "channel",
              as: "subscribers",
            },
          },
          {
            $addFields: {
              subscribers: { $size: "$subscribers" },
            },
          },
          {
            $project: {
              fullName: 1,
              username: 1,
              avatar: 1,
              coverImage: 1,
              subscribers: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $addFields: {
        owner: { $first: "$owner" },
        likes: { $size: "$likes" },
      },
    },
  ]);
  if(video?.length==0){
    throw new ApiError(400,"video not found ");
  }
  return res.status(200).json(new ApiResponse(200,video[0],"video get successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const localThumnailPath = req.file?.path;
  const {videoId} = req.params;
  if (!isValidObjectId(videoId)) {
    localThumnailPath && fs.unlinkSync(localThumnailPath);
    throw new ApiError(400,"inValid video id or video not exists");
  }

  if (!title && !description && !localThumnailPath) {
    throw new ApiError(400, "No any field find to update");
  }
  let video = await Video.findById(videoId);
  if (!video) {
    localThumnailPath && fs.unlinkSync(localThumnailPath);
    throw new ApiError(400, "invalid video id or video not exists");
  }
  const thumnail = await updateOnCloudinary(
    localThumnailPath,
    video?.thumnail.public_id
  );
  if (title) {
    video.title = title;
  }
  if (description) {
    video.description = description;
  }
  if (thumnail) {
    video.thumnail.url = thumnail.url;
    video.thumnail.public_id = thumnail.public_id;
  }
  video = await video.save({saveBeforeValidate:true});
  console.log(video);
  return res
    .status(200)
    .json(new ApiResponse(200, video, "video updated successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  let video = await Video.findById(videoId);
  video.isPublished = !video.isPublished;
  await video.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, video, "published status updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const video = await Video.findByIdAndDelete(videoId);
  if (!video) {
    throw new ApiError(400, "Error occure while deleting the video");
  }
  await deleteOnCloudinary(video?.videoFile.public_id,'video');
  await deleteOnCloudinary(video?.thumnail.public_id,'image');
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "video deleted successfully"));
});
export {
  publishAVideo,
  getVideoById,
  updateVideo,
  togglePublishStatus,
  deleteVideo,
  getAllVideos,
};
