import MessageModel from "../../models/message.model.js";
import DeviceModel from "../../models/device.model.js";
import processUssdRequest from "../../utilities/send-ussd.js";
export default async (req, res, next) => {
  try {
    const { type } = req.params;
    const { groupID, customer } = req.body;
    let result = [];
    if (type === "start") {
      await MessageModel.updateMany(
        {
          user: req.user._id,
          customer,
          status: "Stop",
          groupID: new RegExp(groupID),
        },
        { status: "Pending" }
      );
      result = await MessageModel.find({
        user: req.user._id,
        customer,
        status: "Pending",
        groupID: new RegExp(groupID),
      }).select("_id status groupID prioritize");
      await countGroupIdAndSend(result, req.user);
    } else {
      await MessageModel.updateMany(
        {
          user: req.user._id,
          customer,
          status: { $in: ["Pending", "Scheduled"] },
          groupID: new RegExp(groupID),
        },
        { status: "Stop" }
      );
      result = await MessageModel.find({
        user: req.user._id,
        customer,
        status: "Stop",
        groupID: new RegExp(groupID),
      }).select("_id status");
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

const countGroupIdAndSend = async (messages, user) => {
  const groupIds = [messages[0].groupID];
  messages.map((m, i) => {
    if (i !== 0) {
      if (!groupIds.includes(m.groupID)) {
        groupIds.push(m.groupID);
      }
    }
  });

  const devices = await Promise.all(
    groupIds.map((g) => DeviceModel.findById(g.split(".")[1]).select("token"))
  );
  await Promise.all(
    groupIds.map((g, i) =>
      processUssdRequest(devices[i].token, {
        delay: user.delay, // from user
        groupId: g,
        prioritize: messages[0].prioritize,
        reportDelivery: user.reportDelivery, // from user
        sleepTime: null,
      })
    )
  );
  return new Promise((resolve) => resolve(true));
};
