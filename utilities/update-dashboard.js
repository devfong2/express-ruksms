import UserModel from "../models/user.model.js";
import MessageModel from "../models/message.model.js";
import UssdModel from "../models/ussd.model.js";
import DeviceModel from "../models/device.model.js";
export default (req) => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve) => {
    const user = await UserModel.findById(req.user._id);
    let count;
    if (user.isAdmin === 1) {
      const [
        messagesPending,
        messagesScheduled,
        messagesQueued,
        messagesSent,
        messagesFailed,
        messagesReceived,
        ussdPending,
        ussdSent,
        users,
        deviceInQueued,
      ] = await Promise.all([
        MessageModel.find({
          status: "Pending",
        }).countDocuments(),
        MessageModel.find({
          status: "Scheduled",
        }).countDocuments(),
        MessageModel.find({
          status: "Queued",
        }).countDocuments(),
        MessageModel.find({
          status: { $in: ["Sent", "Delivered"] },
        }).countDocuments(),
        MessageModel.find({
          status: "Failed",
        }).countDocuments(),
        MessageModel.find({
          status: "Received",
        }).countDocuments(),
        UssdModel.find({
          response: "รอดำเนินการ",
        }).countDocuments(),
        UssdModel.find({
          response: { $ne: "รอดำเนินการ" },
        }).countDocuments(),
        UserModel.find({ isAdmin: { $ne: 1 } }).countDocuments(),
        findDeviceInQueued(req),
      ]);
      count = {
        pending: messagesPending,
        scheduled: messagesScheduled,
        queued: messagesQueued,
        sent: messagesSent,
        failed: messagesFailed,
        received: messagesReceived,
        ussdPending,
        ussdSent,
        credits: user.credits,
        user: users,
        deviceInQueued,
      };
    } else {
      const [
        messagesPending,
        messagesScheduled,
        messagesQueued,
        messagesSent,
        messagesFailed,
        messagesReceived,
        ussdPending,
        ussdSent,
        deviceInQueued,
      ] = await Promise.all([
        MessageModel.find({
          user: req.user._id,
          status: "Pending",
        }).countDocuments(),
        MessageModel.find({
          user: req.user._id,
          status: "Scheduled",
        }).countDocuments(),
        MessageModel.find({
          user: req.user._id,
          status: "Queued",
        }).countDocuments(),
        MessageModel.find({
          user: req.user._id,
          status: { $in: ["Sent", "Delivered"] },
        }).countDocuments(),
        MessageModel.find({
          user: req.user._id,
          status: "Failed",
        }).countDocuments(),
        MessageModel.find({
          user: req.user._id,
          status: "Received",
        }).countDocuments(),
        UssdModel.find({
          userID: req.user._id,
          response: "รอดำเนินการ",
        }).countDocuments(),
        UssdModel.find({
          userID: req.user._id,
          response: { $ne: "รอดำเนินการ" },
        }).countDocuments(),
        findDeviceInQueued(req),
      ]);
      count = {
        pending: messagesPending,
        scheduled: messagesScheduled,
        queued: messagesQueued,
        sent: messagesSent,
        failed: messagesFailed,
        received: messagesReceived,
        ussdPending,
        ussdSent,
        credits: user.credits,
        deviceInQueued,
        // user: users,
      };
    }
    // console.log(messagesPending);

    // console.log(count);
    req.app.io.emit("updateDashboard", {
      userId: req.user._id,
      count,
    });
    resolve(count);
  });
};

const findDeviceInQueued = (req) => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    try {
      const group = await MessageModel.aggregate([
        { $match: { status: "Queued", user: req.user._id } },
        { $group: { _id: "$groupID" } },
      ]);
      const data = [];
      for (let i = 0; i < group.length; i++) {
        const device = await DeviceModel.findById(group[i]._id.split(".")[1]);

        const mess = await MessageModel.countDocuments({
          status: "Queued",
          user: req.user._id,
          groupID: group[i]._id,
        });

        data.push({
          groupID: group[i]._id,
          value: mess,
          color: "linear-gradient(to bottom, #fdb954, #fbe05f)",
          icon: "mdi-clock-time-seven-outline",
          title: device.name || device.model,
          deviceID: device.ID,
        });
      }
      data.sort((a, b) => a.deviceID - b.deviceID);
      // console.log(group);
      resolve(data);
    } catch (e) {
      reject(e);
    }
  });
};
