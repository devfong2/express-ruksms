import Jwt from "jsonwebtoken";
import config from "../config/index.js";
import UserModel from "../models/user.model.js";
import DeviceModel from "../models/device.model.js";
import UssdModel from "../models/ussd.model.js";
import { comparePassword } from "../utilities/password.js";
import createID from "../utilities/create-id.js";
const registerDevice = async (req, res, next) => {
  try {
    console.log(1);
    const { email, password, androidId, model, key } = req.body;
    if (!androidId && !model) {
      const err = new Error(`ข้อมูลที่ส่งมาเกิดความผิดพลาด`);
      err.statusCode = 200;
      throw err;
    }
    // find user in database
    let user;
    if (email && password) {
      user = await UserModel.findOne({ email });

      // ไม่พบผู้ใช้
      if (!user) {
        const err = new Error(`ไม่พบอีเมล ${email} ในระบบ`);
        err.statusCode = 200;
        throw err;
      }
      // ตรวจรหัสผ่าน
      const checkPassword = await comparePassword(password, user.password);
      if (!checkPassword) {
        const err = new Error("รหัสผ่านไม่ถูกต้อง");
        err.statusCode = 200;
        throw err;
      }
    } else if (key) {
      console.log(key);
      user = await UserModel.findOne({ apiKey: key });
    }

    const totalDevice = await DeviceModel.find({ userId: user._id });
    if (user.devicesLimit && totalDevice.length >= user.devicesLimit) {
      const err = new Error("คุณไม่สามารถเพิ่มอุปกรณ์ได้อีก");
      err.statusCode = 200;
      throw err;
    }

    // หาค่ามากที่สุดของ ID
    const allDevice = await DeviceModel.find();

    const ID = await createID(allDevice);

    // แปลง สตริงซิมจากโทรศัพท์ให้เป็นเจสัน
    req.body.sims = req.body.from ? req.body.sims : JSON.parse(req.body.sims);

    // เช็คว่ามีแล้วหรือไม่
    const findDeviceByAndroidId = await DeviceModel.findOne({
      androidId: req.body.androidId,
    });
    let device;

    if (findDeviceByAndroidId) {
      device = await DeviceModel.findByIdAndUpdate(
        findDeviceByAndroidId._id,
        {
          ...req.body,
          userID: user.ID,
          // androidID: req.body.androidId,
        },
        { new: true }
      );
      await device.populate("user");
    } else {
      // เพิ่มข้อมูลอุปกรณ์
      device = new DeviceModel({
        ...req.body,
        userID: user.ID,
        ID,
        user: user._id,
        // androidID: req.body.androidId,
      });
      await device.save();
      await device.populate("user");
      req.app.socket.emit("updateDevice", {
        type: "newDevice",
        device,
      });
    }

    // req.app.socket.emit("newmsg", { msg: "Hey mama" });

    res.json({
      success: true,
      data: {
        senderId: config.GATEWAY.SENDER_ID,
        purchaseCode: config.GATEWAY.PURCHASE_CODE,
        device,
      },
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

const updateToken = async (req, res, next) => {
  try {
    console.log(2);
    const { androidId, token } = req.body;
    if (!androidId && !token) {
      const err = new Error(`ข้อมูลที่ส่งมาเกิดความผิดพลาด`);
      err.statusCode = 200;
      throw err;
    }

    const findDeviceByAndroidId = await DeviceModel.findOneAndUpdate(
      { androidId },
      { token },
      { new: true }
    ).populate("user");

    res.json({
      success: true,
      data: findDeviceByAndroidId,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

const signIn = async (req, res, next) => {
  try {
    console.log(3 + "times");

    const { androidId, userId } = req.body;
    console.table(req.body);
    if (!androidId && !userId) {
      const err = new Error(`ข้อมูลที่ส่งมาเกิดความผิดพลาด`);
      err.statusCode = 200;
      throw err;
    }

    const user = await UserModel.findOne({ ID: userId });
    if (!user) {
      const err = new Error(`ไม่พบบัญชีผู้ใช้`);
      err.statusCode = 200;
      throw err;
    }

    const deviceOfUser = await DeviceModel.find({ userID: user.ID }).populate(
      "user"
    );
    if (deviceOfUser.length === 0) {
      const err = new Error(`คุณยังไม่ได้เพิ่มอุปกรณ์ในบัญชีของคุณ`);
      err.statusCode = 200;
      throw err;
    }

    const findDeviceByAndroidId = deviceOfUser.find(
      (d) => d.androidId === androidId
    );

    if (!findDeviceByAndroidId) {
      const err = new Error(`ไม่มีอุปกรณ์นี้ในบัญชีของคุณ`);
      err.statusCode = 200;
      throw err;
    }

    const device = await DeviceModel.findByIdAndUpdate(
      findDeviceByAndroidId.id,
      { enabled: 1 },
      { new: true }
    ).populate("user");

    // await findDeviceByAndroidId.populate("user");

    const token = Jwt.sign(
      {
        userID: user.ID,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
        timeZone: user.timeZone,
      },
      config.JWT_SECRET,
      { expiresIn: "1h" }
    );
    req.app.socket.emit("updateDevice", {
      type: "signIn",
      androidId: req.body.androidId,
    });
    res.json({
      success: true,
      data: {
        sessionId: token,
        device,
      },
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

const signOut = async (req, res) => {
  console.log(req.body);
  await DeviceModel.findOneAndUpdate(
    { androidId: req.body.androidId },
    { enabled: 0 }
  );
  req.app.socket.emit("updateDevice", {
    type: "signOut",
    androidId: req.body.androidId,
  });
  res.json({
    success: true,
    data: null,
    error: null,
  });
};

const ussdResponse = async (req, res, next) => {
  try {
    console.table(req.body);
    const ussd = await UssdModel.findOneAndUpdate(
      { ID: req.body.ussdId },
      {
        response: req.body.response,
        responseDate: new Date().toISOString(),
      },
      { new: true }
    );
    req.app.socket.emit("updateUssd", ussd);
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
  registerDevice,
  updateToken,
  signIn,
  ussdResponse,
  signOut,
};
