import { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const isVideoOwner=asyncHandler(async(req,_,next)=>{
    const userId=req.user?._id;
    const {videoId}=req.params;
    if(!isValidObjectId(videoId)){
        throw new ApiError("invalid video id or video not exists");
    }
    const video=await Video.findById(videoId);
    if(!video){
        throw new ApiError(403,"Invalid video Id provided");
    }
    if(!video.owner.equals(userId)){
        throw new ApiError(403,"unauthorized, you have no permission");
    }
    next();
})