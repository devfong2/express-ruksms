import MessageModel from "./../../models/message.model.js";

export default async (req, res, next) => {
  try {
    console.log("=======report-status=====");
    const messages = JSON.parse(req.body.messages);
    console.log(JSON.parse(req.body.messages));
    for (let i = 0; i < messages.length; i++) {
      // console.log(messages[i]);
      await MessageModel.findOneAndUpdate(
        { ID: messages[i].ID, deliveredDate: { $ne: null } },
        {
          deliveredDate: new Date(),
          errorCode: messages[i].errorCode,
          resultCode: messages[i].resultCode,
          status: messages[i].status,
        }
      );
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
