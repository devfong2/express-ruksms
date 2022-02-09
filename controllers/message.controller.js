import moment from "moment";
import DeviceModel from "../models/device.model.js";
import checkDeviceBeforeSend from "../utilities/check-device-before-send.js";
import { generateGroupID } from "../utilities/generate-api-key.js";
import processUssdRequest from "../utilities/send-ussd.js";
import MessageModel from "./../models/message.model.js";
import SettingModel from "./../models/setting.model.js";
import UserModel from "../models/user.model.js";
import updateDashboard from "../utilities/update-dashboard.js";

const sendMessage = async (req, res, next) => {
  try {
    const { user } = req;
    const { messages, prioritize, senders, schedule, perMessage } = req.body;
    // เช็คเครดิต
    let present;
    let timeForSend;
    if (schedule) {
      present = moment();
      timeForSend = moment(schedule);
      if (timeForSend < present) {
        throw new Error(
          "The schedule time must be greater than the current time."
        );
      }

      // console.log(timeForSend.diff(present, "minutes"));
    }

    if (user.credits !== null && user.credits < messages.length * perMessage) {
      const err = new Error("Your credits not enough");
      err.statusCode = 402;
      throw err;
    }
    //เช็คสถานะเครื่อง
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

    // message footer
    const newUser = await SettingModel.findOne({ name: "newUser" });
    let messageFooter = "";
    if (
      user.contactsLimit !== null &&
      user.contactsLimit <= newUser.value.contacts &&
      newUser.value.messageFooter.enable === 1
    ) {
      messageFooter = "\n" + newUser.value.messageFooter.message;
    }

    let indexDevice = 0;
    messages.map((m) => {
      const obj = {
        ID: maxMessageIdValue,
        number: m.number,
        message: m.message + messageFooter,
        groupID: `${groupID}.${senders[indexDevice].device}`,
        prioritize,
        userID: req.user.ID,
        user: req.user._id,
        deviceID: senders[indexDevice].deviceID,
        device: senders[indexDevice].device,
        simSlot: senders[indexDevice].simSlot,
        status: schedule ? "Scheduled" : "Pending",
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
    if (schedule) {
      const minute = timeForSend.diff(present, "minutes");
      const second = minute * 60 * 1000;
      const totalCredits = messages.length * perMessage;
      waitTimeForSend(
        user,
        groupID,
        senders,
        prioritize,
        second,
        totalCredits,
        req
      );
    } else {
      checkCountDeviceAndSend(user, groupID, senders, prioritize);
      if (user.credits !== null) {
        const currentCredit = user.credits - messages.length * perMessage;
        await UserModel.findByIdAndUpdate(user._id, { credits: currentCredit });
      }
    }
    await updateDashboard(req);

    res.json({
      success: true,
      data: result,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

const waitTimeForSend = (
  user,
  groupID,
  senders,
  prioritize,
  second,
  totalCredits,
  req
) => {
  const timer = setTimeout(async () => {
    await MessageModel.updateMany(
      { groupID: { $regex: ".*" + groupID + ".*" }, status: "Scheduled" },
      { status: "Pending" }
    );
    checkCountDeviceAndSend(user, groupID, senders, prioritize);
    if (user.credits !== null) {
      const currentCredit = user.credits - totalCredits;
      await UserModel.findByIdAndUpdate(user._id, { credits: currentCredit });
    }
    await updateDashboard(req);
    clearTimeout(timer);
  }, second);
};

const checkCountDeviceAndSend = async (user, groupID, senders, prioritize) => {
  const devices = [];
  senders.map((s) => {
    const sameDevice = devices.find((d) => d === s.device);
    if (!sameDevice) {
      devices.push(s.device);
    }
  });
  // console.log(devices);

  for (let i = 0; i < devices.length; i++) {
    const device = await DeviceModel.findById(devices[i]);
    if (!device) {
      break;
    }
    const obj = {
      delay: user.delay, // from user
      groupId: `${groupID}.${devices[i]}`,
      prioritize,
      reportDelivery: user.reportDelivery, // from user
      sleepTime: null, // from user
    };
    await processUssdRequest(device.token, obj);
    // console.log(result.data);
  }
};

const deleteMessage = async (req, res, next) => {
  try {
    const { idForDelete } = req.body;
    await MessageModel.deleteMany({ _id: { $in: idForDelete } });

    res.json({
      success: true,
      data: null,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

const allMessage = async (req, res, next) => {
  try {
    let messages;
    if (req.user.isAdmin === 1) {
      const { id } = req.query;
      messages = await MessageModel.find({ user: id }).sort({ sentDate: -1 });
    } else {
      messages = await MessageModel.find({ user: req.user._id }).sort({
        sentDate: -1,
      });
    }

    res.json({
      success: true,
      data: messages,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

const searchMessage = async (req, res, next) => {
  try {
    const { user, startDate, endDate } = req.body;
    let messages;
    if (req.user.isAdmin === 1) {
      messages = await MessageModel.find({
        user,
        deliveredDate: {
          $gte: new Date(startDate),
          $lt: new Date(endDate),
        },
      }).sort({
        sentDate: -1,
      });
    } else {
      messages = await MessageModel.find({
        user: req.user._id,
        deliveredDate: {
          $gte: new Date(startDate),
          $lt: new Date(endDate),
        },
      }).sort({
        sentDate: -1,
      });
    }
    res.json({
      success: true,
      data: messages,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

export default { sendMessage, allMessage, deleteMessage, searchMessage };
