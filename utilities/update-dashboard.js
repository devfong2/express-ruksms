import UserModel from "../models/user.model.js";
import MessageModel from "../models/message.model.js";
import UssdModel from "../models/ussd.model.js";
export default (req) => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve) => {
    const messages = await MessageModel.find({ user: req.user._id });
    const users = await UserModel.find({ isAdmin: { $ne: 1 } });
    const ussds = await UssdModel.find({ userID: req.user._id });
    const user = await UserModel.findById(req.user._id);

    const count = {
      pending: messages.filter((m) => m.status === "Pending").length,
      scheduled: messages.filter((m) => m.status === "Scheduled").length,
      queued: messages.filter((m) => m.status === "Queued").length,
      sent: messages.filter(
        (m) => m.status === "Sent" || m.status === "Delivered"
      ).length,
      failed: messages.filter((m) => m.status === "Failed").length,
      received: messages.filter((m) => m.status === "Received").length,
      ussdPending: ussds.filter((u) => u.response === "รอดำเนินการ").length,
      ussdSent: ussds.filter((u) => u.response !== "รอดำเนินการ").length,
      credits: user.credits,
      user: users.length,
    };
    // console.log(count);
    req.app.io.emit("updateDashboard", {
      userId: req.user._id,
      count,
    });
    resolve(count);
  });
};
