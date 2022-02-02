import MessageModel from "./../../models/message.model.js";
import UserModel from "../../models/user.model.js";
import updateDashboard from "../../utilities/update-dashboard.js";

export default async (req, res, next) => {
  try {
    // console.log("=======report-status=====");
    if (!req.body.messages) {
      const err = new Error(`Invalid data`);
      err.statusCode = 200;
      throw err;
    }
    const messages = JSON.parse(req.body.messages);
    // console.log(JSON.parse(req.body.messages));
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
        const user = await UserModel.findById(oneMessage.user);
        const plusCredit = Math.ceil(oneMessage.message.length / 70);
        if (user.credits !== null) {
          const totalCredits = user.credits + plusCredit;
          // console.log(user.credits);
          // console.log(totalCredits);
          await UserModel.findByIdAndUpdate(oneMessage.user, {
            credits: totalCredits,
          });
        }
      }

      req.user = { _id: oneMessage.user };
      await updateDashboard(req);
    }
    // JSON.stringify(req.body.message)
    // console.log("=======report-status=====");
    res.json({
      success: true,
      data: null,
      error: null,
    });
  } catch (e) {
    // console.log(e);
    next(e);
  }
};
