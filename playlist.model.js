import mongoose, { Schema } from "mongoose";

const playlistSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "name is required"],
    },
    description: {
      type: String,
      trim: true,
      required: [true, "description is required!"],
    },
    videos: [
        { 
            type: Schema.Types.ObjectId, 
            ref: "Video" 
        }
    ],
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true,
    }
  },
  { timestamps: true, versionKey: false }
);

export const Playlist = mongoose.model("Playlist", playlistSchema);
