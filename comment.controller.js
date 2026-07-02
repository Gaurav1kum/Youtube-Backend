import mongoose ,{isValidObjectId} from "mongoose"
import { Comment } from "../models/comment.model.js";

import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

const getVideoComments=asyncHandler(async(req,res)=>{
    let {videoId}=req.params;
    const{page=1,limit=10}=req.query;
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"invalid videoId provide");
    }
    videoId=new mongoose.Types.ObjectId(videoId);
    const allComment=await Comment.aggregate([
        {
          $match: {
            video: videoId,
          }
        },
        { $skip: (page-1)*limit },
        { $limit: limit },
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
                  coverImage: 1,
                  avatar: 1
                }
              }
            ]
          }
        },{$lookup: {
          from: 'likes',
          localField: "_id",
          foreignField: "comment",
          as: "totalLikes"
        }},{
          $addFields: {
            owner: {$first:"$owner"},
            totalLikes:{$size:"$totalLikes"}
          }
        },{$project: {
          owner:1,
          content:1,
          totalLikes:1
        }}
      ]);
      return res.status(200).json(new ApiResponse(200,allComment,"comment get successfully"));
});

const addComment=asyncHandler(async(req,res)=>{
    const userId=req.user?._id;
    const {videoId}=req.params;
    const video=await Video.findById(videoId);
    if(!video){
        throw new ApiError(400,"invalid videoId provided");
    }
    const {content}=req.body;
    if(!content){
        throw new ApiError(400,"please provide valid content");
    }
    const comment=await Comment.create({
        content:content,
        video:video._id,
        owner:userId
    });
    return res.status(201).json(new ApiResponse(201,comment,"comment add successfully"));

});

const updateComment=asyncHandler(async(req,res)=>{
    const {commentId}=req.params;
    const {content}=req.body;
    if(!content){
        throw new ApiError(400,"provide a valid comment message");
    }
    if(!commentId){
        throw new ApiError(400,"please provide a valid comment id");
    }
    const comment=await Comment.findByIdAndUpdate(commentId,{
        $set:{
            content:content.trim()
        }
    },{new :true});
    res.status(200).json(new ApiResponse(200,comment,"comment update successfully"));
});

const deleteComment=asyncHandler(async(req,res)=>{
    const {commentId}=req.params;
    await Comment.findByIdAndDelete(commentId);
    return res.status(200).json(new ApiResponse(200,{},"comment deleted successfully"));

})

export {
    getVideoComments,
    addComment,
    deleteComment,
    updateComment
}