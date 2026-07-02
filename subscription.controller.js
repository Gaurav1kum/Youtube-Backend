import { Subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import mongoose, { isValidObjectId } from "mongoose";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!isValidObjectId(channelId)) {
    throw new ApiError(404, "channalId is required!");
  }
  const channel = await User.findById(channelId);
  if (!channel) {
    throw new ApiError(404, "channal does not exists");
  }
  const userId = req.user?._id;
  const subscription = await Subscription.findOne({
    channel: channelId,
    subscriber: userId,
  });
  if (!subscription) {
    const newSubsriton = new Subscription({
      channel: channelId,
      subscriber: userId,
    });
    await newSubsriton.save();
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "channal subcribed successfully"));
  } else {
    await Subscription.deleteOne({ channel: channelId, subscriber: userId });
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "unsubsribed successfully"));
  }
});

// using populate method
const getAllSubscriberDetailsOfChannel=asyncHandler(async(req,res)=>{
    const {channelId}=req.params;
    if(!isValidObjectId(channelId)){
        throw new ApiError(400,"Invalid channelId");
    }
    const subscriberdUser=await Subscription.find({channel:channelId}).populate({
        path:"subscriber",
        select:"-password -refreshToken -watchHistory -email -__v",
    }).select("-createdAt -updatedAt -__v -channel -_id");
    return res.status(200).json(new ApiResponse(200,subscriberdUser,"subscriber found successfully"));
})
/*
const getAllSubscriberDetailsOfChannel = asyncHandler(async (req, res) => {
  let { channelId } = req.params;
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channelId");
  }
  channelId = new mongoose.Types.ObjectId(channelId);
  const subscribedUser = await Subscription.aggregate([
    {
      $match: {
        channel: channelId,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriber",
        pipeline: [
          {
            $project: {
              fullName: 1,
              username: 1,
              createdAt: 1,
              avatar: 1,
              coverImage: 1,
            },
          },
        ],
      },
    },
    {
      $project: {
        subscriber: 1,
        _id: 0,
      },
    },
    {
      $addFields: {
        subscriber: {
          $arrayElemAt: ["$subscriber", 0],
        },
      },
    },
  ]);
  console.log(subscribedUser);
  return res
    .status(200)
    .json(
      new ApiResponse(200, subscribedUser, "subscriber found successfully")
    );
});*/

const getAllSubscridedChannelDetailsofUser = asyncHandler(async (req, res) => {
  let { subscriberId } = req.params;
  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "invalid subscriberId or  not exists");
  }
  subscriberId = new mongoose.Types.ObjectId(subscriberId);
  const channals = await Subscription.aggregate([
    {
      $match: {
        subscriber: subscriberId,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channel",
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
        channel: {
          $first: "$channel",
        },
      },
    },
    {
      $project: {
        channel: 1,
        _id: 0,
      },
    },
  ]);
  return res
    .status(200)
    .json(new ApiResponse(200, channals, "all channels found successfully"));
});
export {
  toggleSubscription,
  getAllSubscridedChannelDetailsofUser,
  getAllSubscriberDetailsOfChannel,
};
