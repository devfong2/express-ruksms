import UserModel from "../models/user.model.js";
import MessageModel from "../models/message.model.js";
import UssdModel from "../models/ussd.model.js";
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
