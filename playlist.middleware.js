import {asyncHandler} from "../utils/asyncHandler.js";

import {ApiError} from "../utils/ApiError.js"
import { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import {Video} from "../models/video.model.js";

const isPlaylistOwner=asyncHandler(async(req,res)=>{
    let {playlistId}=req.params;
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid  playlistId");
    }
    const playlist=await Playlist.findById(playlistId);
    if(!playlist){
        throw new ApiError(404,"playlist not exists");
    };
    const userId=req.user._id;
    if(!playlist.owner.equals(userId)){
        throw new ApiError(401,"unauthorized you have no permission");
    }
    next();
})

export {
    isPlaylistOwner
}