import UserModel from "../../models/user.model.js";
import activity from "../../utilities/activity.js";
import { comparePassword, hashPassword } from "../../utilities/password.js";
comparePassword;
export default async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await UserModel.findById(req.params.id)
      .populate({
        path: "subscription",
        populate: {
          path: "planID",
        },
      })
      .populate("userDetail");
    if (!user) {
      throw new Error("user not found");
    }
    const check = await comparePassword(currentPassword, user.password);
    if (!check) {
      throw new Error("password incorrect");
    }
    user.password = await hashPassword(newPassword);
    await user.save();
    req.user = { _id: user.id };
    await activity(req, `เปลี่ยนรหัสผ่านเรียบร้อย`);
    res.json({
      success: true,
      data: user,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};
