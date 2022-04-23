import MessageModel from "./../../models/message.model.js";
import UserModel from "../../models/user.model.js";
import { decryptData } from "../../utilities/cryptoJs.js";
// import updateDashboard from "../../utilities/update-dashboard.js";
export default async (req, res, next) => {
  try {
    console.log("=======get-message=====");
    console.table(req.body);
    const { groupId, limit } = req.body;
    if (!groupId) {
      const err = new Error(`Invalid data`);
      err.statusCode = 200;
      throw err;
    }
    const messages = await MessageModel.find({
      groupID: groupId,
      status: "Pending",
    }).limit(parseInt(limit));

    // if (messages.length !== 0) {
    const user = await UserModel.findById(messages[0].user);
    const idForUpdate = messages.map((m) => m._id);
    // await MessageModel.updateMany(
    //   {
    //     _id: { $in: idForUpdate },
    //     status: "Pending",
    //   },
    //   { status: "Queued", sentDate: new Date() }
    // );
    // const messages2 = await decodeData(messages, user.apiKey);

    // eslint-disable-next-line no-unused-vars
    const [result, messages2] = await Promise.all([
      MessageModel.updateMany(
        {
          _id: { $in: idForUpdate },
          status: "Pending",
        },
        { status: "Queued", sentDate: new Date() }
      ),
      decodeData(messages, user.apiKey),
    ]);

    // }
    // console.log(messages2);
    // console.log("messages 1" + messages);
    console.log("จำนวนข้อความ ::" + messages2.length);

    console.log("=======get-message=====");
    req.user = { _id: user._id };
    waitTimeForUpdateFromQueueToSent(messages);
    res.json({
      success: true,
      data: {
        messages,
        totalCount: messages2.length,
      },
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

const waitTimeForUpdateFromQueueToSent = (messages) => {
  const timer = setTimeout(async () => {
    // await Promise.all(
    //   messages.map((m) =>
    //     MessageModel.updateOne(
    //       { _id: m._id, status: "Queued" },
    //       { status: "Sent" }
    //     )
    //   )
    // );
    await MessageModel.updateMany(
      { _id: { $in: messages.map((m) => m._id) }, status: "Queued" },
      { status: "Sent", sentDate: new Date() }
    );

    // await updateDashboard(req);
    clearTimeout(timer);
  }, 1000 * 300);
};

const decodeData = async (messages, secret) => {
  const messages2 = [];
  for (let i = 0; i < messages.length; i++) {
    messages[i].message = await decryptData(messages[i].message, secret);
    messages2.push(messages[i]);
  }

  return new Promise((resolve) => resolve(messages2));
};
