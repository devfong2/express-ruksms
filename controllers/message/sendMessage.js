import moment from "moment";
import MessageModel from "../../models/message.model.js";
import DeviceModel from "../../models/device.model.js";
import UserModel from "../../models/user.model.js";
import checkDeviceBeforeSend from "../../utilities/check-device-before-send.js";
import { generateGroupID } from "../../utilities/generate-api-key.js";
import SettingModel from "../../models/setting.model.js";
import updateDashboard from "../../utilities/update-dashboard.js";
import activity from "../../utilities/activity.js";
import waitTimeForSend from "./waitTimeForSend.js";
import checkCountDeviceAndSend from "./checkCountDeviceAndSend.js";
import { encryptData } from "../../utilities/cryptoJs.js";

export default async (req, res, next) => {
  try {
    const { user } = req;
    const { messages, prioritize, senders, schedule, perMessage, customer } =
      req.body;
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
        message: encryptData(m.message + messageFooter, user.apiKey),
        groupID: `${groupID}.${senders[indexDevice].device}`,
        prioritize: parseInt(prioritize),
        userID: req.user.ID,
        user: req.user._id,
        deviceID: senders[indexDevice].deviceID,
        device: senders[indexDevice].device,
        simSlot: senders[indexDevice].simSlot,
        status: schedule ? "Scheduled" : "Pending",
        schedule: schedule ? schedule : null,
        sentDate: schedule ? schedule : new Date(),
        perMessage: parseInt(perMessage),
        messageLength: m.message.length,
        customer: customer ? customer : null,
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
