import UserModel from "../../models/user.model.js";
import createID from "../../utilities/create-id.js";
import { hashPassword } from "../../utilities/password.js";
import generateApiKey from "../../utilities/generate-api-key.js";
import activity from "../../utilities/activity.js";
import SettingModel from "../../models/setting.model.js";
import UserDetailModel from "../../models/userDetail.model.js";
export default async (req, res, next) => {
  try {
    const { name, password, email, phone, address } = req.body;
    const allUser = await UserModel.find();
    const findUser = allUser.find((a) => a.email === email);
    const findPhone = allUser.find((a) => a.phone === phone);
    if (findUser) {
      throw new Error("Email already exist");
    }
    if (findPhone) {
      throw new Error("phone already exist");
    }
    const newUser = await SettingModel.findOne({ name: "newUser" });
    const ID = await createID(allUser);
    const obj = {
      ID,
      name,
      password: await hashPassword(password),
      email,
      apiKey: await generateApiKey(40),
      delay: newUser.value.delay,
      reportDelivery: newUser.value.reportDelivery,
      autoRetry: newUser.value.autoRetry,
      credits: newUser.value.credits,
      contactsLimit: newUser.value.contacts,
      devicesLimit: newUser.value.devices,
      sortPhone: newUser.value.sortPhone,
      dateAdded: new Date(),
      expiryDate: new Date().setDate(
        new Date().getDate() + newUser.value.expiryAfter
      ),
      phone,
    };

    const user = new UserModel(obj);
    await user.save();
    await UserDetailModel.create({
      user: user._id,
      knownFrom: "เพื่อน",
      address,
    });
    await activity(req, `สร้างบัญชีผู้ใช้งาน ${email}`);

    res.status(201).json({
      success: true,
      data: user,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};
