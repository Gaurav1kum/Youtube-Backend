import {Tweet} from "../models/tweet.model.js";

import {asyncHandler} from "../utils/asyncHandler.js"

import {ApiError} from "../utils/ApiError.js"
import { isValidObjectId } from "mongoose";

const isTweetOwner=asyncHandler(async(req,_,next)=>{
    const {tweetId}=req.params;
    const userId=req.user._id;
    if(!isValidObjectId(tweetId)){
        throw new ApiError("please provide valid tweet id")
    }
    const tweet=await Tweet.findById(tweetId);
    if(!tweet){
        throw new ApiError(400,"invalid tweet id");
    }
    if(!tweet.owner.equals(userId)){
        throw new ApiError(400,"unauthorized to do this task");
    }
    next();
})

export {isTweetOwner}