import UserModel from "../../models/user.model.js";
import SettingModel from "../../models/setting.model.js";
import createID from "../../utilities/create-id.js";
import { hashPassword } from "../../utilities/password.js";
import generateApiKey from "../../utilities/generate-api-key.js";
import fs from "fs";
import path from "path";
import handlebars from "handlebars";
import config from "../../config/index.js";
import sendMail from "../../utilities/send-mail.js";
import activity from "../../utilities/activity.js";
import UserDetailModel from "../../models/userDetail.model.js";
export default async (req, res, next) => {
  try {
    const { name, password, email, phone, knownFrom } = req.body;
    const allUser = await UserModel.find();
    const findUser = allUser.find((a) => a.email === email);
    const findPhone = allUser.find((a) => a.phone === phone);
    const findName = allUser.find((a) => a.name === name);
    if (findUser) {
      throw new Error("Email already exist");
    }
    if (findPhone) {
      throw new Error("Phone already exist");
    }
    if (findName) {
      throw new Error("Name already exist");
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
      knownFrom,
    });
    const html = fs.readFileSync(
      path.join(path.resolve(), "email/registration.html"),
      {
        encoding: "utf-8",
      }
    );
    const template = handlebars.compile(html);
    const replacements = {
      user: name,
      server: config.IO_CORS,
      userEmail: email,
      password,
      credits: user.credits,
      devices: user.devicesLimit,
      contacts: user.contactsLimit,
      expiryDate: new Date(user.expiryDate).toLocaleString("default", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    };
    const htmlToSend = template(replacements);
    // console.log(html);

    await sendMail("Register success ✔️", user.email, htmlToSend);
    req.user = { _id: user._id };
    await activity(req, `สมัครสมาชิกเรียบร้อย`);
    res.json({
      success: true,
      data: null,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};
