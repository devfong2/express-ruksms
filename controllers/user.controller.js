import Jwt from "jsonwebtoken";
import UserModel from "../models/user.model.js";
import ContactListModel from "../models/contactList.model.js";
import ContactModel from "../models/contact.model.js";
import MessageModel from "../models/message.model.js";
import UssdModel from "../models/ussd.model.js";
import TemplateModel from "../models/template.model.js";
import DeviceModel from "../models/device.model.js";
import config from "../config/index.js";
import createID from "../utilities/create-id.js";
import { comparePassword, hashPassword } from "../utilities/password.js";
import generateApiKey from "../utilities/generate-api-key.js";
// import SettingModel from "../models/setting.model.js";
// import sendMail from "../utilities/send-mail.js";
// import fs from "fs";
// import path from "path";
// import handlebars from "handlebars";
const createUser = async (req, res, next) => {
  try {
    const { name, password, email } = req.body;
    const allUser = await UserModel.find();
    const ID = await createID(allUser);
    const obj = {
      ID,
      name,
      password: await hashPassword(password),
      email,
      apiKey: await generateApiKey(40),
    };

    const user = new UserModel(obj);
    await user.save();
    res.status(201).json({
      success: true,
      data: user,
      error: null,
    });
    //------------------------------------
    // const sett = await SettingModel.findOne({ name: "mailFormat" });

    // const html = fs.readFileSync(
    //   path.join(path.resolve(), "email/registration.html"),
    //   {
    //     encoding: "utf-8",
    //   }
    // );
    // const template = handlebars.compile(html);
    // const replacements = {
    //   username: "Pond Plus Plus",
    //   linkUrl: "https://ruksms.com/en",
    // };
    // const htmlToSend = template(replacements);
    // // console.log(html);

    // await sendMail(
    //   "Register success ✔️",
    //   "tanyawutsaensuk@gmail.com",
    //   htmlToSend
    // );
    // res.json("success");
  } catch (e) {
    next(e);
  }
};

const allUser = async (req, res, next) => {
  try {
    let users;
    if (req.user.isAdmin === 1) {
      users = await UserModel.find();
    } else {
      users = await UserModel.find({ _id: req.user._id });
    }
    res.json({
      success: true,
      data: users,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

const signIn = async (req, res, next) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });
    if (!user) {
      throw new Error(`ไม่พบอีเมล ${req.body.email} ในระบบ`);
    }

    const checkPassword = await comparePassword(
      req.body.password,
      user.password
    );
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

    res.json({
      success: true,
      data: token,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

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

const updateUser = async (req, res, next) => {
  try {
    const user = await UserModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json({
      success: true,
      data: user,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await UserModel.findById(req.params.id);
    if (!user) {
      throw new Error("user not found");
    }
    const check = await comparePassword(currentPassword, user.password);
    if (!check) {
      throw new Error("password incorrect");
    }
    user.password = await hashPassword(newPassword);
    await user.save();
    res.json({
      success: true,
      data: user,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { idForDelete } = req.body;
    if (!idForDelete) {
      throw new Error("idForDelete is required");
    }
    if (!Array.isArray(idForDelete)) {
      throw new Error(
        "idForDelete must be array.Example idForDelete:['61ea2b2d5e02bae9674dfec1','61ea2b2d5e02bae9674dfec2']"
      );
    }

    // ============================================================
    await UserModel.deleteMany({ _id: { $in: idForDelete } });
    for (let i = 0; i < idForDelete.length; i++) {
      const contactList = await ContactListModel.find({
        userID: idForDelete[i],
      });
      for (let k = 0; k < contactList.length; k++) {
        await ContactModel.deleteMany({ contactListID: contactList[k]._id });
      }

      await MessageModel.deleteMany({ user: idForDelete[i] });
      await UssdModel.deleteMany({ userID: idForDelete[i] });
      await TemplateModel.deleteMany({ userID: idForDelete[i] });
      await DeviceModel.updateMany(
        { user: idForDelete[i] },
        { enabled: 0, available: false }
      );
    }
    res.json({
      success: true,
      data: null,
      error: null,
    });
  } catch (e) {
    // console.log(e);
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
  deleteUser,
};
