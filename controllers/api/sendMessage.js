import DeviceModel from "../../models/device.model.js";
import checkDeviceBeforeSend from "../../utilities/check-device-before-send.js";
import sendMessage from "../message/sendMessage.js";

export default async (req, res, next) => {
  try {
    if (!req.is("application/json")) {
      const err = new Error("Content-Type must be application/json");
      err.statusCode = 406;
      throw err;
    }
    const { numbers, message, devices } = req.body;
    const senders = [];
    for (let i = 0; i < devices.length; i++) {
      const device = await DeviceModel.findOne({
        ID: devices[i].device,
        user: req.user._id,
      });
      await checkDeviceBeforeSend(device, devices[i].simSlot);
      senders.push({
        deviceID: device.ID,
        device: device._id,
        simSlot: devices[i].simSlot,
      });
    }

    const messages = numbers.map((n) => ({ number: n, message }));
    const obj = {
      messages,
      prioritize: 0,
      perMessage: message.length,
      senders,
    };

    req.body = obj;
    return sendMessage(req, res, next, true);
  } catch (e) {
    next(e);
  }
};
