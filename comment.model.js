import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { Like } from "./like.model.js";
const commentSchema=new Schema({
    content:{
        type:String,
        required:[true,"content is required"],
    },
    video:{
        type:Schema.Types.ObjectId,
        ref:"Video",
        required:[true,"video id is required to comment"]
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:[true,"comment ower is required!"]
    }


},{timestamps:true,versionKey:false});

commentSchema.post('findOneAndDelete',async function(doc){
    await Like.deleteMany({comment:doc._id});
})
commentSchema.plugin(mongooseAggregatePaginate);
export const Comment =mongoose.model("Comment",commentSchema);