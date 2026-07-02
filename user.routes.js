import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  updateUserAvatar,
  updateUserCoverImage,
  updateUserFullName,
  changeCurrentPassword,
  getUserChannelProfile,
  getWatchHistory,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
const Router = express.Router({ mergeParams: true });

Router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);

Router.route("/login").post(loginUser);

//secure routes

Router.route("/logout").post(verifyJWT, logoutUser);
Router.route("/refresh-token").post(refreshAccessToken);
Router.route("/get-user").get(verifyJWT, getCurrentUser);
Router.route("/change-password").patch(verifyJWT, changeCurrentPassword);
Router.route("/update-fullname").patch(verifyJWT, updateUserFullName);
Router.route("/update-avatar").patch(
  [verifyJWT, upload.single("avatar")],
  updateUserAvatar
);
Router.route("/update-cover-image").patch(
  [verifyJWT, upload.single("coverImage")],
  updateUserCoverImage
);
Router.route("/channel/:username").get(verifyJWT, getUserChannelProfile);
Router.route("/watch-history").get(verifyJWT, getWatchHistory);
export default Router;
