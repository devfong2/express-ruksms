// import jwt from "jsonwebtoken";
import CryptoJS from "crypto-js";
import config from "../../config/index.js";
import mongoose from "mongoose";
import UserModel from "../../models/user.model.js";
import { comparePassword } from "../../utilities/password.js";
export default async (req, res, next) => {
  try {
    // ใน req.headers จะเป็นตัวพิมพ์เล็กหมด
    const { requestuid, authorization } = req.headers;
    if (typeof requestuid !== "string") {
      const err = new Error("requestUId must be a string");
      err.statusCode = 406;
      throw err;
    }

    if (typeof authorization !== "string") {
      const err = new Error("Authorization must be a string");
      err.statusCode = 406;
      throw err;
    }
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

    const publicKeyIsUserId = decrypted.toString(CryptoJS.enc.Utf8);
    // console.log(publicKeyIsUserId);
    if (!publicKeyIsUserId) {
      const err = new Error("Invalid requestUId");
      err.statusCode = 401;
      throw err;
    }

    if (!mongoose.Types.ObjectId.isValid(publicKeyIsUserId)) {
      const err = new Error("Invalid requestUId");
      err.statusCode = 401;
      throw err;
    }

    if (!authorization) {
      const err = new Error("Authorization is required");
      err.statusCode = 401;
      throw err;
    }
    const splitAuth = authorization.split(" ");
    // console.log(splitAuth);
    if (splitAuth[0].toString().toLowerCase() !== "bearer") {
      const err = new Error("Required authorization type Bearer token only ");
      err.statusCode = 401;
      throw err;
    }

    const words = CryptoJS.enc.Base64.parse(splitAuth[1]);
    const token = CryptoJS.enc.Utf8.stringify(words);
    const publicKeyInAuthNotDecrypt = token.split("::")[0];
    const secretKeyInAuth = token.split("::")[1];

    if (publicKeyInAuthNotDecrypt !== requestuid) {
      const err = new Error("Invalid Token");
      err.statusCode = 401;
      throw err;
    }
    // console.log(publicKeyInAuthNotDecrypt);
    // console.log(publicKeyIsUserId);
    // console.log(secretKeyInAuth);

    const user = await UserModel.findById(publicKeyIsUserId).populate(
      "userDetail"
    );
    // console.log(user);

    if (!user) {
      const err = new Error("Invalid Token");
      err.statusCode = 401;
      throw err;
    }

    const checkApiKey = await comparePassword(user.apiKey, secretKeyInAuth);
    if (!checkApiKey) {
      const err = new Error("Invalid Token");
      err.statusCode = 401;
      throw err;
    }

    // เช็คระงับการใช้งาน
    if (user.userDetail[0].suspend === 0) {
      const err = new Error("Your account is suspend");
      err.statusCode = 405;
      throw err;
    }

    // เช็ควันหมดอายุและเครดิต
    const present = new Date();
    const expiryDate = new Date(user.expiryDate);
    if (user.expiryDate !== null && present > expiryDate) {
      const err = new Error(
        "Your account is expired.Please subscribed my plan"
      );
      err.statusCode = 402;
      throw err;
    }

    req.user = user;

    next();
  } catch (e) {
    next(e);
  }
};
