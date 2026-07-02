import express from "express";
import {
  toggleSubscription,
  getAllSubscridedChannelDetailsofUser,
  getAllSubscriberDetailsOfChannel,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const Router = express.Router();

Router.route("/c/:channelId")
  .post(verifyJWT, toggleSubscription)
  .get(getAllSubscriberDetailsOfChannel);

Router.route("/u/:subscriberId").get(getAllSubscridedChannelDetailsofUser);

export default Router;
