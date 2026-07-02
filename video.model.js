import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import {Comment} from "./comment.model.js";
import { Like } from "./like.model.js";
import { ApiError } from "../utils/ApiError.js";
const videoSchema = new Schema(
  {
    videoFile: {
      url: {
        type: String,
        required: [true, "videoFile are required!"],
      },
      public_id: String,
    },
    thumnail: {
      url: {
        type: String,
        required: [true, "thumnail is required!"],
      },
      public_id: String,
    },
    title: {
      type: String,
      required: [true, "title is required!"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "description is required!"],
      trim: true,
    },
    duration: {
      type: Number,
      required: [true, "duration is required"],
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);
videoSchema.post("findOneAndDelete",async function(doc){
  // console.log(doc);
  // await Comment.deleteMany({video:doc._id});
  // await Like.deleteMany({video:doc._id});

  if (doc) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const comments = await Comment.find({ video: doc._id }).session(session);
        const commentIds = comments.map(comment => comment._id);

        if (commentIds.length > 0) {
            await Like.deleteMany({ comment: { $in: commentIds } }).session(session);
        }

        await Comment.deleteMany({ video: doc._id }).session(session);
        await Like.deleteMany({ video: doc._id }).session(session);

        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        console.error(error);
        throw new ApiError(500,"some error occure while deleting video");
    } finally {
        session.endSession();
    }
}
})
videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);
