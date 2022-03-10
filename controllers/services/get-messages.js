import CryptoJS from "crypto-js";
import MessageModel from "./../../models/message.model.js";
import UserModel from "../../models/user.model.js";
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
    let messages2 = [];
    if (messages.length !== 0) {
      const user = await UserModel.findById(messages[0].user);
      const idForUpdate = messages.map((m) => m._id);
      await MessageModel.updateMany(
        {
          _id: { $in: idForUpdate },
          status: "Pending",
        },
        { status: "Queued", sentDate: new Date() }
      );
      messages2 = messages.map((m) => {
        const obj = m;
        const decrypted = CryptoJS.AES.decrypt(m.message, user.apiKey);
        obj.message = decrypted.toString(CryptoJS.enc.Utf8);
        return obj;
      });
      console.log(messages2);
    }
    // console.log(messages);
    // console.log("=======get-message=====");
    res.json({
      success: true,
      data: {
        messages2,
        totalCount: messages2.length,
      },
      error: null,
    });
  } catch (e) {
    next(e);
  }
};
