import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "username are required!"],
      unique: [true, "username is already exists"],
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, "email are required!"],
      unique: [true, "email is already exists"],
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: [true, "fullname are required!"],
      index: true,
      trim: true,
    },
    avatar: {
      url: {
        type: String,
        required: [true, "Avatar URL is required"],
      },
      public_id: {
        type: String,
        required: [true, "Avatar public_id is required"],
      },
    },
    coverImage: {
      url: String,
      public_id: String,
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: [true, "password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) next();
  this.password = await bcrypt.hash(this.password,10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  const payload = {
    _id: this._id,
    email: this.email,
    username: this.username,
    fullName: this.fullName,
  };
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });
};
userSchema.methods.generateRefreshToken = function () {
  const payload = {
    _id: this._id,
  };
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });
};

const User = mongoose.model("User", userSchema);

export { User };
