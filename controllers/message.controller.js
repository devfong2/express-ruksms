// mport DeviceModel from "../models/device.model.js"
import DeviceModel from "../models/device.model.js";
import checkDeviceBeforeSend from "../utilities/check-device-before-send.js";
import { generateGroupID } from "../utilities/generate-api-key.js";
import processUssdRequest from "../utilities/send-ussd.js";
import MessageModel from "./../models/message.model.js";
import SettingModel from "./../models/setting.model.js";

const sendMessage = async (req, res, next) => {
  try {
    const { user } = req;
    const { messages, prioritize, senders } = req.body;

    for (let i = 0; i < senders.length; i++) {
      const device = await DeviceModel.findOne({
        _id: senders[i].device,
        user: user._id,
      });
      await checkDeviceBeforeSend(device, senders[i].simSlot);
    }

    // หาไอดี
    const maxMessageId = await SettingModel.findOne({ name: "maxMessageId" });
    let maxMessageIdValue = maxMessageId.value;
    // group id
    const groupID = await generateGroupID(50);
    const manyMessage = [];

    let indexDevice = 0;
    messages.map((m) => {
      const obj = {
        ID: maxMessageIdValue,
        number: m.number,
        message: m.message,
        groupID: `${groupID}.${senders[indexDevice].device}`,
        prioritize,
        userID: req.user.ID,
        user: req.user._id,
        deviceID: senders[indexDevice].deviceID,
        device: senders[indexDevice].device,
        simSlot: senders[indexDevice].simSlot,
      };
      manyMessage.push(obj);
      maxMessageIdValue++;

      // เช็คว่าเวียนจำนวนเครืองหรือยัง
      indexDevice++;
      if (indexDevice > senders.length - 1) {
        indexDevice = 0;
      }
    });
    await SettingModel.findByIdAndUpdate(maxMessageId._id, {
      value: maxMessageIdValue,
    });
    // console.log(manyMessage);
    const result = await MessageModel.insertMany(manyMessage);
    checkCountDevice(groupID, senders, prioritize);
    res.json({
      success: true,
      data: result,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

const checkCountDevice = async (groupID, senders, prioritize) => {
  const devices = [];
  senders.map((s) => {
    const sameDevice = devices.find((d) => d === s.device);
    if (!sameDevice) {
      devices.push(s.device);
    }
  });
  console.log(devices);

  for (let i = 0; i < devices.length; i++) {
    const device = await DeviceModel.findById(devices[i]);
    if (!device) {
      break;
    }
    const obj = {
      delay: "1", // from user
      groupId: `${groupID}.${devices[i]}`,
      prioritize,
      reportDelivery: 0, // from user
      sleepTime: null, // from user
    };
    const result = await processUssdRequest(device.token, obj);
    console.log(result.data);
  }
};

export default { sendMessage };
