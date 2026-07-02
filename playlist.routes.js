import express from "express";
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getUserPlaylists, removeVideoToPlaylist, updatePlaylist } from "../controllers/playlist.controller.js";
import { isPlaylistOwner } from "../middlewares/playlist.middleware.js";

const Router=express.Router({mergeParams:true});

Router.route("/").post(verifyJWT,createPlaylist)

Router.route("/:playlistId")
.delete([verifyJWT,isPlaylistOwner],deletePlaylist)
.patch([verifyJWT,isPlaylistOwner],updatePlaylist)

Router.route("add/:videoId/:playlist").patch([verifyJWT,isPlaylistOwner],addVideoToPlaylist);
Router.route("/remove/:videoId/:playlist").patch([verifyJWT,isPlaylistOwner],removeVideoToPlaylist);
Router.route("/user/:userId").get(getUserPlaylists);

export default Router