import fs from "fs";
import path from "path";
import Jwt from "jsonwebtoken";
import handlebars from "handlebars";
import UserModel from "../../models/user.model.js";
import config from "../../config/index.js";
import sendMail from "../../utilities/send-mail.js";
import activity from "../../utilities/activity.js";
export default async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new Error("Email not found");
    }

    const html = fs.readFileSync(
      path.join(path.resolve(), "email/resetPasswordLink.html"),
      {
        encoding: "utf-8",
      }
    );
    const token = Jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      config.JWT_SECRET,
      { expiresIn: "2h" }
    );
    const template = handlebars.compile(html);
    const replacements = {
      user: user.name,
      linkReset: config.IO_CORS + "/newpassword?token=" + token,
    };
    const htmlToSend = template(replacements);
    // console.log(html);

    await sendMail("Link reset password 🔑", user.email, htmlToSend);
    await activity(user.id, `ร้องขอการเปลี่ยนรหัสผ่าน`);
    res.json({
      success: true,
      data: null,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};
