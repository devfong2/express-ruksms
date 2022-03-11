import MessageModel from "./../../models/message.model.js";
import UserModel from "../../models/user.model.js";
import { decryptData } from "../../utilities/cryptoJs.js";
export default async (req, res, next) => {
  try {
    // console.log("=======get-message=====");
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
    await MessageModel.updateMany(
      {
        _id: { $in: idForUpdate },
        status: "Pending",
      },
      { status: "Queued", sentDate: new Date() }
    );
    const messages2 = await decodeData(messages, user.apiKey);
    // }
    // console.log(messages2);
    // console.log("messages 1" + messages);
    // console.log("messages 2" + messages2);
    // console.log("=======get-message=====");
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

const decodeData = (messages, secret) => {
  const messages2 = messages.map((m) => {
    const obj = m;

    obj.message = decryptData(m.message, secret);
    return obj;
  });
  return new Promise((resolve) => resolve(messages2));
};
