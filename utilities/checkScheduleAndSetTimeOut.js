import moment from "moment";
import updateDashboard from "./update-dashboard.js";
import processUssdRequest from "./send-ussd.js";
import MessageModel from "../models/message.model.js";
import UserModel from "../models/user.model.js";
import DeviceModel from "../models/device.model.js";
export default async () => {
  try {
    const scheduledMessages = await MessageModel.find({
      status: "Scheduled",
      schedule: { $gte: new Date() },
    });

    const scheduledMessages2 = await MessageModel.find({
      status: "Scheduled",
      schedule: { $lt: new Date() },
    });
    if (scheduledMessages.length !== 0) {
      const totalGroup = groupByGroupId(scheduledMessages);
      // console.log(totalGroup);
      totalGroup.map((group) => {
        const time = moment(group.message[0].schedule);
        // console.log(time.diff(moment(), "minutes"));
        const timeForsend = time.diff(moment(), "minutes");
        waitTimeForSend(group, timeForsend * 60 * 1000);
      });
    }
    if (scheduledMessages2.length !== 0) {
      const totalGroup2 = groupByGroupId(scheduledMessages2);
      // console.log(totalGroup);
      totalGroup2.map((group) => {
        waitTimeForSend(group, 1);
      });
    }
  } catch (e) {
    console.error(e);
  }
};

const groupByGroupId = (messages) => {
  const group = [
    {
      groupID: messages[0].groupID,
      message: [messages[0]],
    },
  ];
  messages.slice(0, 1);
  messages.map((m) => {
    const index = group.findIndex((g) => g.groupID === m.groupID);
    if (index === -1) {
      group.push({
        groupID: m.groupID,
        message: [m],
      });
    } else {
      group[index].message.push(m);
    }
  });
  return group;
};

const waitTimeForSend = async (group, second = 1) => {
  const timer = setTimeout(async () => {
    await MessageModel.updateMany(
      { groupID: { $regex: ".*" + group.groupID + ".*" }, status: "Scheduled" },
      { status: "Pending" }
    );

    const user = await UserModel.findById(group.message[0].user);
    if (user.credits !== null) {
      const currentCredit = user.credits - group.message.length;
      user.credits = currentCredit;
      await user.save();
    }
    const device = await DeviceModel.findById(group.message[0].device);
    const obj = {
      delay: user.delay, // from user
      groupId: group.groupID,
      prioritize: group.message[0].prioritize,
      reportDelivery: user.reportDelivery, // from user
      sleepTime: null, // from user
    };
    await processUssdRequest(device.token, obj);
    const req = {
      user: {
        _id: user._id,
      },
    };
    await updateDashboard(req);
    clearTimeout(timer);
  }, second);
};
