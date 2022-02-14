import UserModel from "../models/user.model.js";
import MessageModel from "../models/message.model.js";
import UssdModel from "../models/ussd.model.js";
export default (req) => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve) => {
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
      user,
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
      UserModel.find({ isAdmin: { $ne: 1 } }).countDocuments(),
      UserModel.findById(req.user._id),
    ]);
    // console.log(messagesPending);

    const count = {
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
    // console.log(count);
    req.app.io.emit("updateDashboard", {
      userId: req.user._id,
      count,
    });
    resolve(count);
  });
};
