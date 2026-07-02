
import {v2 as cloudinary}  from "cloudinary";
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const uploadOnCloudinary=async(localFilePath)=>{
    try {
        if(!localFilePath) return null;
        const response=await cloudinary.uploader.upload(localFilePath,{
            resource_type:'auto',
            folder:'youtubebackend',
            overwrite:true,
        });
        //file has been successfully uploaded
        return response;
    } catch (error) {
      return null;
    }finally{
      localFilePath &&  fs.unlinkSync(localFilePath) ;
    }
  }
  const updateOnCloudinary=async(localFilePath,public_id)=>{
    try {
        if(!localFilePath) return null;
        const response=await cloudinary.uploader.upload(localFilePath,{
            resource_type:'auto',
            public_id:public_id,
            overwrite:true,
        });
        //file has been successfully uploaded
        return response;
    } catch (error) {
      return null;
    }finally{
      localFilePath && fs.unlinkSync(localFilePath) ;
    }
  }

  const deleteOnCloudinary = async (public_id, resource_type="auto") => {
    try {
        // invalidate: to remove cached content
        // resource_type: 'video'  //for video files
        const options = { invalidate: true };

        if (resource_type) {
            options.resource_type = resource_type;
        }

        return await cloudinary.uploader.destroy(public_id, options)

    } catch (err) {
        console.log('Failed to delete Image from Cloudinary:', err.message);
        return null;
    }
}

  export {uploadOnCloudinary,updateOnCloudinary,deleteOnCloudinary};