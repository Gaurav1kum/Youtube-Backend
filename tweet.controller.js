import {Tweet} from "../models/tweet.model.js";

import {asyncHandler} from "../utils/asyncHandler.js"

import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js";
import { isValidObjectId } from "mongoose";

const createTweet =  asyncHandler(async(req,res)=>{
    const userId=req.user._id;
    const {content}=req.body;
    if(!content){
        throw new ApiError(400,"please provide content to tweet");
    }
    const tweet=await Tweet.create({
        content:content,
        owner:userId
    });
    return res.status(201).json(new ApiResponse(201,tweet,"tweet created succesfully"));
})

const getUserTweets=asyncHandler(async(req,res)=>{
    const {userId}=req.params;
    if(!isValidObjectId(userId)){
        throw new ApiError(400,"please provide valid userId");
    }
    const tweets=await Tweet.find({owner:userId});
    if(tweets.length==0){
        throw new ApiError(400, "there is no tweet found");
    }
    return res.status(200).json(new ApiResponse(200,tweets,"tweets find successfully"));
});

const updateTweet=asyncHandler(async(req,res)=>{
    const{tweetId}=req.params;
    const {content}=req.body;
    if(!content){
        throw new ApiError(400,"please provide a valid tweet")
    }

    const tweet=await Tweet.findByIdAndUpdate(tweetId,{
        $set:{
            content:content
        }
    },{new:true});

    return res.status(200).json(new ApiResponse(200,tweet,"tweet updated successfully"));
});

const deleteTweet=asyncHandler(async(req,res)=>{
    const {tweetId}=req.params;
    await Tweet.findByIdAndDelete(tweetId);
    return res.status(200).json(new ApiResponse(200,{},"tweet deleted successfully"));
})

export {
    createTweet,
    updateTweet,
    deleteTweet,
    getUserTweets
}
