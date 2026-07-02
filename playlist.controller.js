import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { name, description } = req.body();
  if (!name || !description) {
    throw new ApiError(400, "all fields are required");
  }
  const playlist = await Playlist.create({
    name: name,
    description: description,
    owner: userId,
  });
  if (!playlist) {
    throw new ApiError(400, "error occure while creating playlist");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, "playlist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  let { userId } = req.params;
  if (!isValidObjectId(userId));
  userId = new mongoose.Types.ObjectId(userId);
  const playlists = Playlist.aggregate([
    {
      $match: {
        owner: userId,
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
      },
    },
  ]);
});

const getPlaylistById = asyncHandler(async (req, res) => {
  let { playlistId } = req.params;
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "invalid playlist id provided");
  }
  playlistId = new mongoose.Types.ObjectId(playlistId);
  const playlist = Playlist.aggregate([]);
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { videoId, playlistId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "invalid video provided");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "video not found please provide valid video");
  }
  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $push: {
        videos: videoId,
      },
    },
    { new: true }
  );
  if (!playlist) {
    throw new ApiError(404, "error occure while adding video in playlist");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, playlist, "video added successfully in playlist")
    );
});
const removeVideoToPlaylist = asyncHandler(async (req, res) => {
  const { videoId, playlistId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "invalid video provided");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "video not found please provide valid video");
  }
  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: {
        videos: videoId,
      },
    },
    { new: true }
  );
  if (!playlist) {
    throw new ApiError(404, "error occure while removing video from playlist");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "video added successfully"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const playlist = await Playlist.findByIdAndDelete(playlistId);
  if (!playlist) {
    throw new ApiError(400, "error occure while deleteing playlist");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "playlist deleted successfully"));
});

const updatePlaylist=asyncHandler(async(req,res)=>{
    const {playlistId} =req.params;
    const {name,description}=req.body;
    if(!name && !description){
        throw new ApiError(400,"fields are not found");
    }
    const playlist=await Playlist.findById(playlistId);
    if(name){
        playlist.name=name;
    }
    if(description){
        playlist.description=description
    }
    playlist.save({validateBeforeSave:false});
    return res.status(200).json(new ApiResponse(200,playlist,"playlist updated successfully"));

})

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoToPlaylist,
  deletePlaylist,
  updatePlaylist,
};
