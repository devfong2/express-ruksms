import MessageModel from "../../models/message.model.js";
import sendMessageInAgentRoute from "./send-message.js";
import { decryptData } from "../../utilities/cryptoJs.js";
export default async (req, res, next) => {
  try {
    const { messagesSelect, status, customerAgent, userDelay } = req.body;
    // console.log(req.body);
    // const user = await UserModel.findById(req.user._id);
    let messages = [];
    if (status === "selected") {
      messages = await MessageModel.find({
        _id: { $in: messagesSelect.map((m) => m._id) },
      });
      // console.log(messages);
    } else {
      messages = await MessageModel.find({
        user: req.user._id,
        status,
      });
    }

    // console.log(req.user.apiKey);
    const messagesDecrypted = [];
    for (let i = 0; i < messages.length; i++) {
      const m = messages[i];
      const obj = {
        number: m.number,
        message: await decryptData(m.message, req.user.apiKey),
      };
      messagesDecrypted.push(obj);
    }

    const perMessage = messages.map((m) => m.perMessage);
    const sortPerMessage = perMessage.sort((a, b) => b - a);
    const idForRemove = messages.map((m) => m._id);
    const obj = {
      messages: messagesDecrypted,
      prioritize: 0,
      perMessage: sortPerMessage[0],
      senders: req.body.senders,
      customer: customerAgent,
      idForRemove,
      status,
      userDelay,
    };
    req.body = obj;
    // console.log(messages);
    // console.log(messagesDecrypted);
    // console.log(req.body);

    // return sendMessage(req, res, next, false, true);
    return sendMessageInAgentRoute(req, res, next, false, true);
  } catch (e) {
    next(e);
  }
};
