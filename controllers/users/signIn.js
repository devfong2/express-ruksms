import UserModel from "../../models/user.model.js";
import { comparePassword } from "../../utilities/password.js";
import Jwt from "jsonwebtoken";
import config from "../../config/index.js";
import activity from "../../utilities/activity.js";
export default async (req, res, next) => {
  try {
    // console.log(req.body);
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new Error(`ไม่พบอีเมล ${email} ในระบบ`);
    }

    const checkPassword = await comparePassword(password, user.password);
    if (!checkPassword) {
      throw new Error(`รหัสผ่านไม่ถูกต้อง`);
    }
    const token = Jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      config.JWT_SECRET,
      { expiresIn: "24h" }
    );

    user.lastLogin = new Date();
    await user.save();
    req.user = { _id: user.id };
    await activity(req, `เข้าสู่ระบบ`);

    res.json({
      success: true,
      data: token,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};
