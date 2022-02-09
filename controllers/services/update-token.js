import DeviceModel from "../../models/device.model.js";
// import UssdModel from "../../models/ussd.model.js";
// import MessageModel from "../../models/message.model.js";
export default async (req, res, next) => {
  try {
    // console.log(2);
    const { androidId, token } = req.body;
    if (!androidId && !token) {
      const err = new Error(`Invalid data`);
      err.statusCode = 200;
      throw err;
    }

    const device = await DeviceModel.findOne({ androidId });
    if (device.token !== token) {
      // await UssdModel.deleteMany({ deviceID: device._id });
      // await MessageModel.deleteMany({ device: device._id });

      device.maxUssd = 0;
    }
    device.token = token;
    await device.save();
    await device.populate("user");

    res.json({
      success: true,
      data: device,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};
