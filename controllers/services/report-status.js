import MessageModel from "./../../models/message.model.js";
import UserModel from "../../models/user.model.js";

export default async (req, res, next) => {
  try {
    console.log("=======report-status=====");
    const messages = JSON.parse(req.body.messages);
    console.log(JSON.parse(req.body.messages));
    for (let i = 0; i < messages.length; i++) {
      // console.log(messages[i]);
      const oneMessage = await MessageModel.findOneAndUpdate(
        { ID: messages[i].ID },
        {
          deliveredDate: new Date(),
          errorCode: messages[i].errorCode,
          resultCode: messages[i].resultCode,
          status: messages[i].status,
        }
      );
      if (messages[i].status === "Failed") {
        await UserModel.findByIdAndUpdate(oneMessage.user, {
          $inc: { credits: 1 },
        });
      }
    }
    // JSON.stringify(req.body.message)
    console.log("=======report-status=====");
    res.json({
      success: true,
      data: null,
      error: null,
    });
  } catch (e) {
    console.log(e);
    next(e);
  }
};
