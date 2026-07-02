import { asyncHandler } from "../utils/asyncHandler.js";

import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";

import { uploadOnCloudinary, updateOnCloudinary } from "../utils/cloudinary.js";
import { userSchemaValidate } from "../schemaValidation.js/userSchemaValidation.js";
import fs from "fs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false }); //don't validate this correct

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};
const registerUser = asyncHandler(async (req, res) => {
  //get user details from frontend
  //validate -not empty
  //check if user already exists :username
  //check for images ,check for  avatar
  //upload to cloudinary
  //create user object -create entry in db
  //remove password and refresh token  field from response
  //check for user creation
  //return response

  const { username, email, fullName, password } = req.body;
  const schemaError = userSchemaValidate(req.body);
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
  if (schemaError) {
    avatarLocalPath && fs.unlinkSync(avatarLocalPath);
    coverImageLocalPath && fs.unlinkSync(coverImageLocalPath);
    throw new ApiError(400, schemaError);
  }
  const existedUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existedUser) {
    avatarLocalPath && fs.unlinkSync(avatarLocalPath);
    coverImageLocalPath && fs.unlinkSync(coverImageLocalPath); //then remove from local server
    throw new ApiError(409, "User with email or username already exists");
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  let coverImage = null;
  if (coverImageLocalPath)
    coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }
  const user = await User.create({
    fullName,
    avatar: { url: avatar.url, public_id: avatar.public_id },
    coverImage: {
      url: coverImage?.url || "",
      public_id: coverImage?.public_id || "",
    },
    username: username.toLowerCase(),
    email,
    password,
  });
  if (!user) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }
  user.password = undefined;
  user.refreshToken = undefined;

  return res
    .status(201)
    .json(new ApiResponse(200, user, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  //fetch data from req->body
  //username or emai
  // find the user
  //check password
  //access and refresh token generate
  //send cookies

  const { email, username, password } = req.body;
  if (!username && !email) {
    throw new ApiError(400, "username or email are required");
  }
  if (!password) {
    throw new ApiError(400, "password must be required");
  }
  const user = await User.findOne({ $or: [{ email }, { username }] });
  if (!user) {
    throw new ApiError(404, "User doesnot exist");
  }
  //check password is correct or not
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalids user credentials");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  user.password = undefined;
  user.refreshToken = undefined;
  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user, accessToken, refreshToken },
        "User logged In Sucessfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  const id = req.user._id;
  const user = await User.findByIdAndUpdate(
    id,
    {
      $unset: {
        refreshToken: "", //$unset basically completely delete the refreshToken field
      },
    },
    { new: true }
  ).select("-password -refreshToken"); //not send password field or refreshToken

  const options = {
    httpOnly: true,
    secure: true,
  };
  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User loggedout successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies?.refreshToken ||
      req.body?.refreshToken ||
      req.header("Authorization").replace("Bearer", "");
    if (!incomingRefreshToken) throw new ApiError(401, "unauthorized request");
    const decodeToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodeToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid refresh Token");
    }
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Invalid refresh Token or expired");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );
    const options = {
      httpOnly: true,
      secure: true,
    };
    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "Access token refresshed!"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "invalid refresh Token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "All fields are required");
  }
  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(
      401,
      "Invalid old passward please provide valid password"
    );
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed Successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: req.user,
      },
      "User get successfully"
    )
  );
});

const updateUserFullName = asyncHandler(async (req, res) => {
  const { fullName } = req.body;
  if (!fullName) {
    throw new ApiError(400, "All fields are required");
  }
  const newUser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName: fullName,
      },
    },
    { new: true }
  ).select("-password -v -refreshToken");
  return res
    .status(200)
    .json(
      new ApiResponse(200, { user: newUser }, "fullName updated successfully")
    );
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  let user = req.user;
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }
  const avatar = await updateOnCloudinary(
    avatarLocalPath,
    user.avatar.public_id
  );
  if (!avatar?.url) throw new ApiError(400, "Error while uploading avatar");

  user = await User.findByIdAndUpdate(
    user._id,
    {
      $set: {
        avatar: { url: avatar.url, public_id: avatar.public_id },
      },
    },
    { new: true }
  ).select("-password -refreshToken -__v");
  return res
    .status(200)
    .json(
      new ApiResponse(200, { user: user }, "Avatar is updated successfully")
    );
});
const updateUserCoverImage = asyncHandler(async (req, res) => {
  let user = req.user;
  const coverImageLocalPath = req.file?.path;
  if (!coverImageLocalPath) {
    throw new ApiError(400, "coverImage file is required!");
  }
  let coverImage = null;
  if (!user.coverImage?.url) {
    coverImage = await uploadOnCloudinary(coverImageLocalPath); //upload
  } else {
    coverImage = await updateOnCloudinary(
      coverImageLocalPath,
      user.coverImage.public_id
    ); //update
  }
  if (!coverImage) {
    throw new ApiError(400, "Error while uploading coverImage");
  }
  user = await User.findByIdAndUpdate(
    user._id,
    {
      $set: {
        coverImage: { url: coverImage.url, public_id: coverImage.public_id },
      },
    },
    { new: true }
  ).select("-password -refressToken -__v");
  return res
    .status(200)
    .json(
      new ApiResponse(200, { user: user }, "coverImage updated successfully")
    );
});
const getUserChannelProfile = asyncHandler(async (req, res) => {
  let { username } = req.params;
  username = username?.trim();
  if (!username) {
    throw new ApiError(400, "username is missing");
  }
  const channel = await User.aggregate([
    { $match: {username:username.toLowerCase()} },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo", //this tells that kis kis channel ko user subscribed kiya hai
      },
    },
    {
      $addFields: {
        subscriberCount: { $size: "$subscribers" },
        channelsSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] }, //this check that kya login user channel ka subscriber hai
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        email: 1,
        subscriberCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
      },
    },
  ]);
  console.log(channel);
  if(channel?.length==0){
    throw new ApiError(404,"Channel does not exists");
  }
  return res.status(200).json(new ApiResponse(200,channel[0],"user channel fetch successfully"))
});

const getWatchHistory=asyncHandler(async(req,res)=>{

  //const userId=new mongoose.Types.ObjectId(req.user._id);
  const userId=req.user._id;

  const history=await User.aggregate([
    {$match:{_id:userId}},
    {
      $lookup:{
        from:"videos",
        localField:"watchHistory",
        foreignField:"_id",
        as:"watchHistory",
        pipeline:[
          {
            $lookup:{
              from:"users",
              localField:"owner",
              foreignField:"_id",
              as:"owner",
              pipeline:[
                {$project:{
                  fullName:1,
                  username:1,
                  avatar:1,
                  coverImage:1
                }}
              ]
            }
          },{
            $addFields:{
              owner:{
                $first:"$owner"//overwite before owner is arr of 1 element
              }
            }
          }
        ]
      }
    }
  ]);

  return res.status(200).json(new ApiResponse(200,history[0].watchHistory,"watch history fetched successfully"));
})

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateUserFullName,
  updateUserCoverImage,
  updateUserAvatar,
  getUserChannelProfile,
  getWatchHistory
};
