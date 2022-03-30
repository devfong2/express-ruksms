// import jwt from "jsonwebtoken";
import CryptoJS from "crypto-js";
import config from "../../config/index.js";
import mongoose from "mongoose";
import UserModel from "../../models/user.model.js";
export default async (req, res, next) => {
  try {
    // ใน req.headers จะเป็นตัวพิมพ์เล็กหมด
    const { requestuid } = req.headers;
    // console.log(req.headers);
    if (!requestuid) {
      const err = new Error("requestUId is required");
      err.statusCode = 401;
      throw err;
    }
    if (requestuid.toString().length !== 64) {
      const err = new Error("Invalid requestUId");
      err.statusCode = 401;
      throw err;
    }
    const decrypted = CryptoJS.AES.decrypt(requestuid, config.JWT_SECRET);

    const userId = decrypted.toString(CryptoJS.enc.Utf8);
    // console.log(userId);
    if (!userId) {
      const err = new Error("Invalid requestUId");
      err.statusCode = 401;
      throw err;
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      const err = new Error("Invalid requestUId");
      err.statusCode = 401;
      throw err;
    }

    const user = await UserModel.findById(userId)
      .populate({
        path: "subscription",
        populate: {
          path: "planID",
        },
      })
      .populate("userDetail");

    if (!user) {
      const err = new Error("invalid requestUId");
      err.statusCode = 401;
      throw err;
    }
    req.user = user;

    next();
  } catch (e) {
    next(e);
  }
};
