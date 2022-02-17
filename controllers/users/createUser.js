import UserModel from "../../models/user.model.js";
import createID from "../../utilities/create-id.js";
import { hashPassword } from "../../utilities/password.js";
import generateApiKey from "../../utilities/generate-api-key.js";
import activity from "../../utilities/activity.js";
export default async (req, res, next) => {
  try {
    const { name, password, email, phone } = req.body;
    const allUser = await UserModel.find();
    const findUser = allUser.find((a) => a.email === email);
    const findPhone = allUser.find((a) => a.phone === phone);
    if (findUser) {
      throw new Error("Email already exist");
    }
    if (findPhone) {
      throw new Error("phone already exist");
    }
    const ID = await createID(allUser);
    const obj = {
      ID,
      name,
      password: await hashPassword(password),
      email,
      apiKey: await generateApiKey(40),
      dateAdded: new Date(),
      phone,
    };

    const user = new UserModel(obj);
    await user.save();
    await activity(req.user._id, `สร้างบัญชีผู้ใช้งาน ${email}`);
    res.status(201).json({
      success: true,
      data: user,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};
