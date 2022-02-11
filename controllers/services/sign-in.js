import Jwt from "jsonwebtoken";
import UserModel from "../../models/user.model.js";
import DeviceModel from "../../models/device.model.js";
import config from "../../config/index.js";
export default async (req, res, next) => {
  try {
    // console.log(3 + "times");

    const { androidId, userId } = req.body;
    // console.table(req.body);
    if (!androidId && !userId) {
      const err = new Error(`Invalid data`);
      err.statusCode = 200;
      throw err;
    }

    const user = await UserModel.findOne({ ID: userId });
    if (!user) {
      const err = new Error(`ไม่พบบัญชีผู้ใช้`);
      err.statusCode = 200;
      throw err;
    }

    const deviceOfUser = await DeviceModel.find({
      userID: user.ID,
      available: true,
    }).populate("user");

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
    req.app.io.emit("updateDevice", {
      userId: user._id,
      type: "signIn",
      androidId: req.body.androidId,
    });

    req.app.io.emit("mobileLogin", {
      key: user.apiKey,
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
