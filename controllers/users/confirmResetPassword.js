import fs from "fs";
import path from "path";
import Jwt from "jsonwebtoken";
import handlebars from "handlebars";
import { hashPassword } from "../../utilities/password.js";
import UserModel from "../../models/user.model.js";
import config from "../../config/index.js";
import sendMail from "../../utilities/send-mail.js";
import activity from "../../utilities/activity.js";
export default async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    const result = Jwt.verify(token, config.JWT_SECRET);
    const expireDate = new Date(0);
    expireDate.setUTCSeconds(result.exp);
    if (expireDate < new Date()) {
      throw new Error("Link reset password is expired");
    }
    const obj = {
      password: await hashPassword(newPassword),
    };
    await UserModel.findByIdAndUpdate(result.id, obj);
    const html = fs.readFileSync(
      path.join(path.resolve(), "email/resetPassword.html"),
      {
        encoding: "utf-8",
      }
    );

    const template = handlebars.compile(html);
    const replacements = {
      user: result.name,
      server: config.IO_CORS,
      userEmail: result.email,
      password: newPassword,
    };
    const htmlToSend = template(replacements);
    // console.log(html);

    await sendMail("Reset password success 🔓", result.email, htmlToSend);
    await activity(
      result.id,
      `เปลี่ยนรหัสผ่านจากลิ้งก์รีเซ็ทรหัสผ่านเรียบร้อย`
    );
    res.json({
      success: true,
      data: null,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};
