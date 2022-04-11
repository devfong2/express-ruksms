import MessageModel from "../../models/message.model.js";
import DeviceModel from "../../models/device.model.js";
import UserModel from "../../models/user.model.js";
import SettingModel from "../../models/setting.model.js";
import updateDashboard from "../../utilities/update-dashboard.js";
import { encryptData } from "../../utilities/cryptoJs.js";
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
    const userForUpdateDashboard = [];
    if (user && device && device.available !== false) {
      const messages2 = JSON.parse(messages);

      const maxMessageId = await SettingModel.findOne({ name: "maxMessageId" });
      let maxMessageIdValue = maxMessageId.value;
      maxMessageId.value = maxMessageIdValue + messages2.length + 1;
      await maxMessageId.save();

      for (let i = 0; i < messages2.length; i++) {
        const obj = {
          ID: maxMessageIdValue,
          number: messages2[i].number,
          message: await encryptData(messages2[i].message, user.apiKey),
          userID: user.ID,
          user: user._id,
          deviceID: device.ID,
          device: device._id,
          simSlot: messages2[i].simSlot,
          status: "Received",
          sentDate: new Date(),
          deliveredDate: new Date(),
        };
        await MessageModel.create(obj);
        maxMessageIdValue++;
        // req.user = { _id: user._id };
        // await updateDashboard(req);
        const index = userForUpdateDashboard.findIndex((u) => u === user._id);
        if (index === -1) {
          userForUpdateDashboard.push(user._id);
        }
      }
    }
    updateUserDashboard(req, userForUpdateDashboard);
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

const updateUserDashboard = async (req, userForUpdateDashboard) => {
  try {
    await Promise.all(
      userForUpdateDashboard.map((u) => {
        req.user = { _id: u };
        return updateDashboard(req);
      })
    );
  } catch (e) {
    console.log(e);
  }
};
