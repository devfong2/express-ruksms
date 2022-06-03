import moment from "moment";
import { encryptData } from "../../utilities/cryptoJs.js";
import DeviceModel from "../../models/device.model.js";
import SettingModel from "../../models/setting.model.js";
import checkDeviceBeforeSend from "../../utilities/check-device-before-send.js";
import messageCon from "./../../controllers/message/index.js";
import { generateGroupID } from "../../utilities/generate-api-key.js";
import MessageModel from "../../models/message.model.js";
import activity from "../../utilities/activity.js";
import processUssdRequest from "../../utilities/send-ussd.js";
export default (req, res, next, fromApi = false, fromAgentResend = false) => {
  try {
    const { userDelay } = req.body;
    // console.log(userDelay);
    const { delay, type } = userDelay;
    if (delay) {
      if (type === 1) {
        return messageCon.sendMessage(req, res, next, fromApi, fromAgentResend);
      } else if (type === 2) {
        return sendMessageController(req, res, next, fromAgentResend);
      }
    } else {
      req.body.userDelay.second = 2;
      return messageCon.sendMessage(req, res, next, fromApi, fromAgentResend);
    }
  } catch (e) {
    next(e);
  }
};

const sendMessageController = async (
  req,
  res,
  next,

  fromAgentResend = false
) => {
  try {
    const { user } = req;
    const {
      prioritize,
      perMessage,
      schedule,
      senders,
      messages,
      customer,
      userDelay,
      idForRemove,
      status,
    } = req.body;
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

    //*เช็คสถานะเครื่อง
    for (let i = 0; i < senders.length; i++) {
      const device = await DeviceModel.findOne({
        _id: senders[i].device,
        user: user._id,
      });
      await checkDeviceBeforeSend(device, senders[i].simSlot);
    }

    //*หาไอดี
    const maxMessageId = await SettingModel.findOne({ name: "maxMessageId" });
    let maxMessageIdValue = maxMessageId.value;
    maxMessageId.value = maxMessageIdValue + messages.length + 1;
    await maxMessageId.save();
    let round = 0;
    let count = 0;
    if (userDelay.roundabout === "hour") {
      round = Math.ceil(messages.length / userDelay.hourPerMessage);
      count = userDelay.hourPerMessage;
    } else if (userDelay.roundabout === "day") {
      round = Math.ceil(messages.length / userDelay.dayPerMessage);
      count = userDelay.dayPerMessage;
    }

    const groupID = await generateGroupID(50);
    const manyMessage = [];

    let indexDevice = 0;
    for (let i = 0; i < messages.length; i++) {
      const obj = {
        ID: maxMessageIdValue,
        number: messages[i].number,
        message: await encryptData(messages[i].message, user.apiKey),
        groupID: `${groupID}.${senders[indexDevice].device}`,
        prioritize: parseInt(prioritize),
        userID: req.user.ID,
        user: req.user._id,
        deviceID: senders[indexDevice].deviceID,
        device: senders[indexDevice].device,
        simSlot: senders[indexDevice].simSlot,
        status: "Scheduled",
        schedule: schedule ? schedule : null,
        sentDate: schedule ? schedule : new Date(),
        perMessage: parseInt(perMessage),
        messageLength: messages[i].message.length,
        customer: customer ? customer : null,
      };
      manyMessage.push(obj);
      maxMessageIdValue++;

      // เช็คว่าเวียนจำนวนเครืองหรือยัง
      indexDevice++;
      if (indexDevice > senders.length - 1) {
        indexDevice = 0;
      }
    }

    const result = await MessageModel.insertMany(manyMessage);
    if (schedule) {
      const minute = timeForSend.diff(present, "minutes");
      const timeOut = minute * 60 * 1000;
      waitTimeForSend(
        result,
        senders,
        round,
        count,
        userDelay.roundabout,
        perMessage,
        groupID,
        user,
        timeOut
      );
    } else {
      sendMessageFollowRoundAbout(
        result,
        senders,
        round,
        count,
        userDelay.roundabout,
        perMessage,
        groupID,
        user
      );
    }
    if (fromAgentResend) {
      await Promise.all([
        MessageModel.deleteMany({ _id: { $in: idForRemove } }),
        await activity(
          req,
          `ส่งข้อความสถานะ ${status} จำนวน ${messages.length} ข้อความ อีกครั้ง`
        ),
      ]);
    } else {
      await activity(req, `ส่งข้อความ ${result.length} ข้อความ`);
    }
    res.status(200).json({
      success: true,
      data: result,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

// ? if schedule property not null
const waitTimeForSend = (
  result,
  senders,
  round,
  count,
  roundabout,
  perMessage,
  groupID,
  user,
  timeOut
) => {
  const timer = setTimeout(() => {
    sendMessageFollowRoundAbout(
      senders,
      round,
      count,
      roundabout,
      perMessage,
      groupID,
      user
    );
    clearTimeout(timer);
  }, timeOut);
};

// ? first function
const sendMessageFollowRoundAbout = async (
  messagesAfterSave,
  senders,
  round,
  count,
  roundabout,
  perMessage,
  groupID,
  user
) => {
  let timer = 0;
  if (roundabout === "hour") {
    // timer = 60*60
    // * 1 hour
    timer = 60 * 60 * 1000;
    // timer = 10000;
  } else if (roundabout === "day") {
    // * 1 day
    timer = 60 * 1000 * 60 * 24;
  }
  console.log(timer);
  for (let i = 0; i < round; i++) {
    const end = i * count + count;
    const start = i * count;
    const messagesForSend = [];
    for (let j = start; j < end; j++) {
      if (j < messagesAfterSave.length) {
        messagesForSend.push(messagesAfterSave[j]);
      }
    }

    await waitForTheAniversary(
      senders,
      messagesForSend,
      timer,
      perMessage,
      groupID,
      user
    );
  }
};

// ? second function
const waitForTheAniversary = async (
  senders,
  messagesForSend,
  timer,
  perMessage,
  groupID,
  user
) => {
  // console.log(messagesForSend.map((item) => item._id));
  await MessageModel.updateMany(
    {
      _id: { $in: messagesForSend.map((item) => item._id) },
      status: "Scheduled",
    },
    { status: "Pending" }
  );
  // console.log(timer);
  const devices = [];
  senders.map((s) => {
    const sameDevice = devices.find((d) => d === s.device);
    if (!sameDevice) {
      devices.push(s.device);
    }
  });

  const devicesInDB = await Promise.all(
    devices.map((d) => DeviceModel.findById(d))
  );

  await Promise.all(
    devicesInDB.map((d) => {
      const obj = {
        delay: perMessage * 2, // from user and agent customer
        groupId: `${groupID}.${d._id}`,
        prioritize: 0,
        reportDelivery: user.reportDelivery, // from user
        sleepTime: null, // from user
      };
      // console.log(obj);
      return processUssdRequest(d.token, obj);
    })
  );

  return new Promise((resolve) => {
    const clock = setTimeout(() => {
      clearTimeout(clock);
      resolve(true);
    }, timer);
  });
};
