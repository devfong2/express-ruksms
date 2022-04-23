import MessageModel from "../../models/message.model.js";
import sendMessage from "../../controllers/message/sendMessage.js";
export default async (req, res, next) => {
  try {
    const { messagesSelect, status, customerAgent } = req.body;
    // console.log(req.body);
    // const user = await UserModel.findById(req.user._id);
    let messages = [];
    if (status === "selected") {
      if (customerAgent) {
        messages = await MessageModel.find({
          _id: { $in: messagesSelect.map((m) => m._id) },
        });
        // console.log(messages);
      } else {
        messages = messagesSelect;
      }
    } else {
      messages = await MessageModel.find({
        user: req.user._id,
        status,
      });
    }

    const perMessage = messages.map((m) => m.perMessage);
    const sortPerMessage = perMessage.sort((a, b) => b - a);
    const idForRemove = messages.map((m) => m._id);
    const obj = {
      messages: messages.map((m) => ({ number: m.number, message: m.message })),
      prioritize: 0,
      perMessage: sortPerMessage[0],
      senders: req.body.senders,
      customer: customerAgent,
      idForRemove,
      status,
    };
    req.body = obj;
    console.log(req.body);

    return sendMessage(req, res, next, false, true);
  } catch (e) {
    next(e);
  }
};
