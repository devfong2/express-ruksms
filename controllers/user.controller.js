import Jwt from "jsonwebtoken";
import UserModel from "../models/user.model.js";
import config from "../config/index.js";
import createID from "../utilities/create-id.js";
import { comparePassword, hashPassword } from "../utilities/password.js";
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
      apiKey: config.GATEWAY.API_KEY,
    };
    const user = new UserModel(obj);
    await user.save();
    // console.log(user._id);
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
    const users = await UserModel.find();
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
      { expiresIn: "6h" }
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

export default {
  createUser,
  allUser,
  signIn,
  me,
  updateUser,
  updatePassword,
};
