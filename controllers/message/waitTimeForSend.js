import MessageModel from "../../models/message.model.js";
import updateDashboard from "../../utilities/update-dashboard.js";
import UserModel from "../../models/user.model.js";
import checkCountDeviceAndSend from "./checkCountDeviceAndSend.js";
export default (
  user,
  groupID,
  senders,
  prioritize,
  second,
  totalCredits,
  req,
  customer,
  perMessage,
  userDelayFromAgent
) => {
  const timer = setTimeout(async () => {
    await MessageModel.updateMany(
      { groupID: { $regex: ".*" + groupID + ".*" }, status: "Scheduled" },
      { status: "Pending" }
    );
    checkCountDeviceAndSend(
      user,
      groupID,
      senders,
      prioritize,
      customer,
      perMessage,
      userDelayFromAgent
    );
    if (user.credits !== null) {
      const currentCredit = user.credits - totalCredits;
      await UserModel.findByIdAndUpdate(user._id, { credits: currentCredit });
    }
    await updateDashboard(req);
    clearTimeout(timer);
  }, second);
};
