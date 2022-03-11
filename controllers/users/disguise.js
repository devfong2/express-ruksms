import UserModel from "../../models/user.model.js";
import Jwt from "jsonwebtoken";
// import { comparePassword } from "../../utilities/password.js";
import config from "../../config/index.js";
import activity from "../../utilities/activity.js";
export default async (req, res, next) => {
  try {
    const { selectedUser, passwordAdmin } = req.body;
    // const admin = await UserModel.findById(req.user._id);
    // const checkPassword = await comparePassword(passwordAdmin, admin.password);
    const checkPassword =
      // eslint-disable-next-line no-undef
      passwordAdmin === Buffer(config.PIN, "base64").toString("utf8");
    if (!checkPassword) {
      throw new Error(`Incorrect pin`);
    }
    const user = await UserModel.findById(selectedUser)
      .populate({
        path: "subscription",
        populate: {
          path: "planID",
        },
      })
      .populate("userDetail");
    const token = Jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      config.JWT_SECRET,
      { expiresIn: "2h" }
    );
    await activity(
      req,
      `ได้สวมสิทธิ์เป็นผู้ใช้งาน ${user.name} [${user.email}]`
    );
    res.json({
      success: true,
      data: { token, user },
      error: null,
    });
  } catch (e) {
    next(e);
  }
};
