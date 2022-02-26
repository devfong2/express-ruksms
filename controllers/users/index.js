import createUser from "./createUser.js";
import allUser from "./allUser.js";
import signIn from "./signIn.js";
import updateUser from "./updateUser.js";
import updatePassword from "./updatePassword.js";
import register from "./register.js";
import deleteUser from "./deleteUser.js";
import resetPassword from "./resetPassword.js";
import verifyToken from "./verifyToken.js";
import confirmResetPassword from "./confirmResetPassword.js";
import getUserDetailByUserId from "./getUserDetailByUserId.js";
import resetUserData from "./resetUserData.js";
import updateUserDetail from "./updateUserDetail.js";
import disguise from "./disguise.js";
import checkRecaptcha from "./checkRecaptcha.js";
import reportUser from "./reportUser.js";

import activity from "../../utilities/activity.js";

const me = (req, res, next) => {
  try {
    res.json({
      success: true,
      data: req.user,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};
const signOut = async (req, res, next) => {
  try {
    await activity(req, `ออกจากระบบ`);
    res.json({
      success: true,
      data: null,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};
export default {
  createUser,
  allUser,
  signIn,
  me,
  updateUser,
  updatePassword,
  register,
  deleteUser,
  resetPassword,
  verifyToken,
  confirmResetPassword,
  getUserDetailByUserId,
  resetUserData,
  updateUserDetail,
  disguise,
  signOut,
  checkRecaptcha,
  reportUser,
};
