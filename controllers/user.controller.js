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
import SettingModel from "../models/setting.model.js";
import sendMail from "../utilities/send-mail.js";
import fs from "fs";
import path from "path";
import handlebars from "handlebars";
const createUser = async (req, res, next) => {
  try {
    const { name, password, email } = req.body;
    const allUser = await UserModel.find();
    const findUser = allUser.find((a) => a.email === email);
    if (findUser) {
      throw new Error("Email already exist");
    }
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

    await UserModel.findByIdAndUpdate(user._id, { lastLogin: new Date() });

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
    if (req.body.updateCredits) {
      const html = fs.readFileSync(
        path.join(path.resolve(), "email/userLimitsUpdate.html"),
        {
          encoding: "utf-8",
        }
      );
      const template = handlebars.compile(html);
      const replacements = {
        user: user.name,
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

      await sendMail("Upgrade account success 💰", user.email, htmlToSend);
    }
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

const register = async (req, res, next) => {
  try {
    const { name, password, email } = req.body;
    const allUser = await UserModel.find();
    const findUser = allUser.find((a) => a.email === email);
    if (findUser) {
      throw new Error("Email already exist");
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
      expiryDate: new Date().setDate(
        new Date().getDate() + newUser.value.expiryAfter
      ),
    };

    const user = new UserModel(obj);
    await user.save();
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
    res.json({
      success: true,
      data: null,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

const resetPassword = async (req, res, next) => {
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
    res.json({
      success: true,
      data: null,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

const verifyToken = async (req, res, next) => {
  try {
    const { token } = req.body;
    const result = Jwt.verify(token, config.JWT_SECRET);
    const expireDate = new Date(0);
    expireDate.setUTCSeconds(result.exp);
    if (expireDate < new Date()) {
      throw new Error("Link reset password is expired");
    }
    // console.log(result);
    res.json({
      success: true,
      data: null,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

const confirmResetPassword = async (req, res, next) => {
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
  deleteUser,
  register,
  resetPassword,
  verifyToken,
  confirmResetPassword,
};
