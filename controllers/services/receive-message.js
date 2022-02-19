import MessageModel from "../../models/message.model.js";
import DeviceModel from "../../models/device.model.js";
import UserModel from "../../models/user.model.js";
import SettingModel from "../../models/setting.model.js";
import updateDashboard from "../../utilities/update-dashboard.js";
export default async (req, res, next) => {
  try {
    const { androidId, userId, messages } = req.body;
    if (!androidId && !userId && !messages) {
      const err = new Error(`Invalid data`);
      err.statusCode = 200;
      throw err;
    }
    // console.log("=========Receive-message===========");
    const device = await DeviceModel.findOne({ androidId });
    const user = await UserModel.findOne({ ID: userId });
    // console.log(req.body);
    if (user && device && device.available !== false) {
      const messages2 = JSON.parse(messages);

      const maxMessageId = await SettingModel.findOne({ name: "maxMessageId" });
      let maxMessageIdValue = maxMessageId.value;
      maxMessageId.value = maxMessageIdValue + messages2.length + 1;
      await maxMessageId.save();

      for (let i = 0; i < messages2.length; i++) {
        await MessageModel.create({
          ID: maxMessageIdValue,
          number: messages2[i].number,
          message: messages2[i].message,
          userID: user.ID,
          user: user._id,
          deviceID: device.ID,
          device: device._id,
          simSlot: messages2[i].simSlot,
          status: "Received",
          sentDate: new Date(),
          deliveredDate: new Date(),
        });
        maxMessageIdValue++;
        req.user = { _id: user._id };
        await updateDashboard(req);
      }
    }
    // console.log("=========Receive-message===========");
    res.json({
      success: true,
      data: null,
      error: null,
    });
  } catch (e) {
    console.error(e.message);
    next(e);
  }
};
