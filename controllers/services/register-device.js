import UserModel from "../../models/user.model.js";
import DeviceModel from "../../models/device.model.js";
import createID from "../../utilities/create-id.js";
import config from "../../config/index.js";
import { comparePassword } from "../../utilities/password.js";
export default async (req, res, next) => {
  try {
    console.log(1);
    const { email, password, androidId, model, key } = req.body;
    if (!androidId && !model) {
      const err = new Error(`Invalid data`);
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
      // console.log(req.body);
      user = await UserModel.findOne({ apiKey: key });
      // console.log(user);
    }

    const totalDevice = await DeviceModel.find({
      user: user._id,
      available: true,
    });
    // console.log(totalDevice);
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
          available: true,
          user: user._id,
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
    }

    req.app.io.emit("updateDevice", {
      userId: user._id,
      type: "newDevice",
      device,
    });

    // console.log(req.app.socket.id);

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
