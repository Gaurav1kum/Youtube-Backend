import express from "express";
import {
  deleteVideo,
  getAllVideos,
  getVideoById,
  publishAVideo,
  togglePublishStatus,
  updateVideo,
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isVideoOwner } from "../middlewares/video.middleware.js";
import {upload} from "../middlewares/multer.middleware.js"
const Router = express.Router({ mergeParams: true });

Router.route("/")
  .get(getAllVideos)
  .post(
    [
      verifyJWT,
      upload.fields([
        {
          name: "videoFile",
          maxCount: 1,
        },
        { name: "thumnail", maxCount: 1 },
      ]),
    ],
    publishAVideo
  );
Router.route("/:videoId")
  .get(getVideoById)
  .delete([verifyJWT, isVideoOwner], deleteVideo)
  .patch([verifyJWT, isVideoOwner, upload.single("thumnail")],updateVideo);

Router.route("/toggle/publish/:videoId").patch(
  [verifyJWT, isVideoOwner],
  togglePublishStatus
);

export default Router;