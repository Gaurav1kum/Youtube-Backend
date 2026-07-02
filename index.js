import dotenv from "dotenv/config";
import connectDB from "./db/index.js";
import app from "./app.js";

connectDB()
  .then(() => {
    const PORT = process.env.PORT || 8000;
    app.on("error", (err) => {
      console.log("Error", err);
    });
    app.listen(PORT, (err) => {
      if (err) {
        console.log("server start error", err);
      } else {
        console.log(`server start on port ${PORT}`);
      }
    });
  })
  .catch((err) => {
    console.log("MONGO DB COnnection failde !!!", err);
  });

/*
;(async()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        app.on('error',(error)=>{
            console.log("error",error);
            throw error;
        })
        app.listen(process.env.PORT,(err)=>{
            console.log(`server start on port ${process.env.PORT}`)
        })
    } catch (error) {
        console.error("Error",error)
    }
})();*/
