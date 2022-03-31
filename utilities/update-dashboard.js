import UserModel from "../models/user.model.js";
import MessageModel from "../models/message.model.js";
import UssdModel from "../models/ussd.model.js";
import DeviceModel from "../models/device.model.js";
//import { log } from "handlebars";
// import SubscriptionModel from "../models/subscription.model.js";
export default (req) => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve) => {
    const user = await UserModel.findById(req.user._id);
    let count;

    if (user.isAdmin === 1) {
      const [
        messageGroup,
        ussdPending,
        ussdSent,
        users,
        deviceInQueued,
        // Income,
      ] = await Promise.all([
        MessageModel.aggregate([
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),
        UssdModel.countDocuments({
          response: "รอดำเนินการ",
        }),
        UssdModel.countDocuments({
          response: { $ne: "รอดำเนินการ" },
        }),
        UserModel.countDocuments({ isAdmin: { $ne: 1 } }),
        findDeviceInQueued(req),
        // SubscriptionModel.find({ referenceNo: { $ne: null } }).select("amount"),
      ]);
      // let earning = 0;
      // Income.map((i) => (earning += i.amount));

      count = {
        pending: findCountInMessageGroup(messageGroup, "Pending"),
        scheduled: findCountInMessageGroup(messageGroup, "Scheduled"),
        queued: findCountInMessageGroup(messageGroup, "Queued"),
        sent: findCountInMessageGroup(messageGroup, "Sent"),
        failed: findCountInMessageGroup(messageGroup, "Failed"),
        received: findCountInMessageGroup(messageGroup, "Received"),
        ussdPending,
        ussdSent,
        credits: user.credits,
        user: users,
        deviceInQueued,
        // earning,
      };
    } else {
      const [messageGroup, ussdPending, ussdSent, deviceInQueued] =
        await Promise.all([
          MessageModel.aggregate([
            { $match: { user: req.user._id } },
            { $group: { _id: "$status", count: { $sum: 1 } } },
          ]),
          UssdModel.count({
            userID: req.user._id,
            response: "รอดำเนินการ",
          }),
          UssdModel.count({
            userID: req.user._id,
            response: { $ne: "รอดำเนินการ" },
          }),
          findDeviceInQueued(req),
        ]);

      // const messageGroup = await ;

      count = {
        pending: findCountInMessageGroup(messageGroup, "Pending"),
        scheduled: findCountInMessageGroup(messageGroup, "Scheduled"),
        queued: findCountInMessageGroup(messageGroup, "Queued"),
        sent: findCountInMessageGroup(messageGroup, "Sent"),
        failed: findCountInMessageGroup(messageGroup, "Failed"),
        received: findCountInMessageGroup(messageGroup, "Received"),
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

const findCountInMessageGroup = (messageGroup, key) => {
  const result = messageGroup.find((i) => i._id === key);
  if (result) {
    return result.count;
  } else {
    return 0;
  }
};

const findDeviceInQueued = (req) => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    try {
      const group = await MessageModel.aggregate([
        { $match: { status: "Queued", user: req.user._id } },
        { $group: { _id: "$deviceID", count: { $sum: 1 } } },
        { $sort: { deviceID: 1 } },
      ]);
      const devices = await Promise.all(
        group.map((g) =>
          DeviceModel.findOne({ ID: g._id }).select("ID name model")
        )
      );
      // console.log(devices);
      const data = [];
      // console.log(group);
      group.map((g, i) =>
        data.push({
          value: g.count,
          color: "linear-gradient(to bottom, #fdb954, #fbe05f)",
          icon: "mdi-clock-time-seven-outline",
          title: devices[i].name || devices[i].model,
          deviceID: devices[i].ID,
        })
      );

      resolve(data);
    } catch (e) {
      reject(e);
    }
  });
};
