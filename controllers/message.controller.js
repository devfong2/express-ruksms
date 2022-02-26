import moment from "moment";
import DeviceModel from "../models/device.model.js";
import checkDeviceBeforeSend from "../utilities/check-device-before-send.js";
import { generateGroupID } from "../utilities/generate-api-key.js";
import processUssdRequest from "../utilities/send-ussd.js";
import MessageModel from "./../models/message.model.js";
import SettingModel from "./../models/setting.model.js";
import UserModel from "../models/user.model.js";
import updateDashboard from "../utilities/update-dashboard.js";
import activity from "../utilities/activity.js";
const sendMessage = async (req, res, next) => {
  try {
    const { user } = req;
    const { messages, prioritize, senders, schedule, perMessage } = req.body;
    const PendingMessage = await MessageModel.countDocuments({
      user: user._id,
      status: "Pending",
    });
    if (PendingMessage > 0) {
      throw new Error(
        "Please wait for the message that you have sent earlier. send successfully first"
      );
    }
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
    maxMessageId.value = maxMessageIdValue + messages.length + 1;
    await maxMessageId.save();
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
        schedule: schedule ? schedule : null,
        sentDate: schedule ? schedule : new Date(),
      };
      manyMessage.push(obj);
      maxMessageIdValue++;

      // เช็คว่าเวียนจำนวนเครืองหรือยัง
      indexDevice++;
      if (indexDevice > senders.length - 1) {
        indexDevice = 0;
      }
    });

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
    await activity(req, `ส่งข้อความ ${result.length} ข้อความ`);

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
    const { idForDelete, user, status, mode } = req.body;
    const query = {};
    if (status !== "All") {
      query.status = status;
    }
    let result;
    if (mode === "selected") {
      result = await MessageModel.deleteMany({ _id: { $in: idForDelete } });
    } else {
      if (req.user.isAdmin === 1) {
        result = await MessageModel.deleteMany({ user, ...query });
      } else {
        result = await MessageModel.deleteMany({
          user: req.user._id,
          ...query,
        });
      }
    }
    if (result.deletedCount === 0) {
      throw new Error("ไม่พบข้อความที่ต้องการลบ");
    }
    // console.log(result);

    await activity(
      req,
      `ลบข้อความ ${mode}-${status} จำนวน ${result.deletedCount} ข้อความ`
    );
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
    const { user, status } = req.body;
    let query = {};
    if (user !== "All") {
      query.user = user;
    }

    if (status !== "All") {
      query.status = status;
    }

    // console.log(query);
    let messages;
    if (req.user.isAdmin === 1) {
      messages = await MessageModel.find(query).select(
        "ID number message schedule sentDate deliveredDate status simSlot -_id"
      );
    } else {
      if (query.user) {
        delete query.user;
      }
      messages = await MessageModel.find({
        user: req.user._id,
        ...query,
      }).select(
        "ID number message schedule sentDate deliveredDate status simSlot -_id"
      );
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
    const {
      user,
      startDate,
      endDate,
      device,
      status,
      mobileNumber,
      message,
      page,
      itemPerPage,
    } = req.body;
    let query = {
      sentDate: {
        $gte: new Date(startDate),
        $lt: new Date(endDate),
      },
    };
    if (user !== "All") {
      query.user = user;
    }
    if (mobileNumber !== "") {
      query.number = new RegExp(mobileNumber);
    }

    if (message !== "") {
      query.message = new RegExp(message);
    }

    if (status !== "All") {
      query.status = status;
    }

    if (device !== "All") {
      query.device = device;
    }
    // console.log(query);
    let messages;
    let count = 0;
    if (req.user.isAdmin === 1) {
      messages = await MessageModel.find(query)
        .sort({
          sentDate: -1,
        })
        .limit(itemPerPage)
        .skip(page * itemPerPage);
      count = await MessageModel.find(query).countDocuments();
    } else {
      messages = await MessageModel.find(query)
        .sort({
          sentDate: -1,
        })
        .limit(itemPerPage)
        .skip(page * itemPerPage);
      count = await MessageModel.find(query).countDocuments();
    }
    res.json({
      success: true,
      data: { messages, count },
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

const resendMessage = async (req, res, next) => {
  try {
    const { messagesSelect, status } = req.body;
    const user = UserModel.findById(req.user._id);
    let messages = [];
    if (status === "selected") {
      messages = messagesSelect;
    } else {
      messages = await MessageModel.find({
        user: req.user._id,
        status,
      });
    }
    if (user.credits !== null && user.credits < messages.length) {
      const err = new Error("Your credits not enough");
      err.statusCode = 402;
      throw err;
    }

    if (messages.length === 0) {
      const err = new Error("no messages to send");

      throw err;
    }

    // หาไอดี
    const maxMessageId = await SettingModel.findOne({ name: "maxMessageId" });
    let maxMessageIdValue = maxMessageId.value;
    maxMessageId.value = maxMessageIdValue + messages.length + 1;
    await maxMessageId.save();
    const manyMessage = [];
    messages.map((m) => {
      const obj = {
        ID: maxMessageIdValue,
        number: m.number,
        message: m.message,
        groupID: m.groupID,
        prioritize: m.prioritize,
        userID: m.userID,
        user: req.user._id,
        deviceID: m.deviceID,
        device: m.device,
        simSlot: m.simSlot,
        status: "Pending",
        schedule: null,
        sentDate: new Date(),
      };
      manyMessage.push(obj);
      maxMessageIdValue++;
    });
    await MessageModel.insertMany(manyMessage);

    const idForRemove = messages.map((m) => m._id);
    await MessageModel.deleteMany({ _id: { $in: idForRemove } });
    await countGroupIdAndSend(messages, user);
    await activity(
      req,
      `ส่งข้อความสถานะ ${status} จำนวน ${messages.length} ข้อความ อีกครั้ง`
    );

    res.json({
      success: true,
      data: null,
      error: null,
    });
    //  if(user.credits !== null )
  } catch (e) {
    next(e);
  }
};

const countGroupIdAndSend = async (messages, user) => {
  const groupIds = [messages[0].groupID];
  messages.map((m, i) => {
    if (i !== 0) {
      if (!groupIds.includes(m.groupID)) {
        groupIds.push(m.groupID);
      }
    }
  });
  for (let i = 0; i < groupIds.length; i++) {
    const device = await DeviceModel.findById(groupIds[i].split(".")[1]);
    if (!device) {
      break;
    }
    const obj = {
      delay: user.delay, // from user
      groupId: groupIds[i],
      prioritize: messages[0].prioritize,
      reportDelivery: user.reportDelivery, // from user
      sleepTime: null, // from user
    };
    await processUssdRequest(device.token, obj);
    // console.log(result.data);
  }
  return new Promise((resolve) => resolve(true));
};

export default {
  sendMessage,
  allMessage,
  deleteMessage,
  searchMessage,
  resendMessage,
};
