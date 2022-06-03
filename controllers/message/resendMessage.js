import UserModel from "../../models/user.model.js";
import MessageModel from "../../models/message.model.js";
import SettingModel from "../../models/setting.model.js";
import DeviceModel from "../../models/device.model.js";
import activity from "../../utilities/activity.js";
import processUssdRequest from "../../utilities/send-ussd.js";
export default async (req, res, next) => {
  try {
    const { messagesSelect, status } = req.body;
    const user = await UserModel.findById(req.user._id);
    let messages = [];
    if (status === "selected") {
      // if (customerAgent) {
      //   messages = await MessageModel.find({
      //     _id: { $in: messagesSelect.map((m) => m._id) },
      //   });
      //   // console.log(messages);
      // } else {
      messages = messagesSelect;
      // }
    } else {
      messages = await MessageModel.find({
        user: req.user._id,
        status,
      });
    }
    if (
      user.isAdmin !== 1 &&
      user.credits !== null &&
      user.credits < messages.length
    ) {
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
        customer: null,
        perMessage: m.perMessage,
        messageLength: m.messageLength,
      };
      manyMessage.push(obj);
      maxMessageIdValue++;
    });

    const idForRemove = messages.map((m) => m._id);
    // await MessageModel.insertMany(manyMessage);
    // await MessageModel.deleteMany({ _id: { $in: idForRemove } });
    // await countGroupIdAndSend(messages, user);
    // await activity(
    //   req,
    //   `ส่งข้อความสถานะ ${status} จำนวน ${messages.length} ข้อความ อีกครั้ง`
    // );

    const result = await Promise.all([
      MessageModel.insertMany(manyMessage),
      MessageModel.deleteMany({ _id: { $in: idForRemove } }),
      countGroupIdAndSend(messages, user),
      activity(
        req,
        `ส่งข้อความสถานะ ${status} จำนวน ${messages.length} ข้อความ อีกครั้ง`
      ),
    ]);
    if (user.isAdmin !== 1 && user.credits !== null) {
      let netCredits = 0;
      messages.map((m) => (netCredits += m.perMessage));
      user.credits -= netCredits;
      await user.save();
    }

    res.json({
      success: true,
      data: result[0],
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
