import MessageModel from "../models/message.model.js";
import DeviceModel from "../models/device.model.js";
import UserModel from "../models/user.model.js";
import processUssdRequest from "./send-ussd.js";
import updateDashboard from "./update-dashboard.js";
export default async (io, status = "Pending", user = "None") => {
  try {
    const query = {};
    query.status = status;
    if (user !== "None") {
      query.user = user;
    }
    const messages = await MessageModel.find(query);
    if (messages.length !== 0) {
      const totalGroup = groupByGroupId(messages);
      // totalGroup.map(async (group) => {
      //   await sendMessage(group, io);
      // });
      await Promise.all(totalGroup.map((group) => sendMessage(group, io)));
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

const sendMessage = async (group, io) => {
  // const user = await UserModel.findById(group.message[0].user);
  // const device = await DeviceModel.findById(group.message[0].device);
  const [user, device] = await Promise.all([
    UserModel.findById(group.message[0].user),
    DeviceModel.findById(group.message[0].device),
  ]);
  const obj = {
    delay: user.delay, // from user
    groupId: group.groupID,
    prioritize: group.message[0].prioritize,
    reportDelivery: user.reportDelivery, // from user
    sleepTime: null, // from user
  };

  // const res = await processUssdRequest(device.token, obj);
  const req = {
    user: {
      _id: user._id,
    },
    app: {
      io,
    },
  };
  // await updateDashboard(req);
  await Promise.all([
    processUssdRequest(device.token, obj),
    updateDashboard(req),
  ]);
  return new Promise((resolve) => resolve(true));
};
