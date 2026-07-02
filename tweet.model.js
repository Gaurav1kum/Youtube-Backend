import mongoose,{Schema} from "mongoose";
import { Like } from "./like.model.js";
const tweetSchema=new Schema({
    content:{
        type:String,
        required:[true,"tweet content is required"],
        trim:true
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:[true,"tweet owner is required"]
    }
},{timestamps:true,versionKey:false});
tweetSchema.post('findOneAndDelete',async function(doc){
    await Like.deleteMany({tweet:doc._id});
})
export const Tweet=mongoose.model("Tweet",tweetSchema);