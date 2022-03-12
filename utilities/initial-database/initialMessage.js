import MessageModel from "./../../models/message.model.js";
import UserModel from "./../../models/user.model.js";
import TemplateModel from "./../../models/template.model.js";
import { encryptData } from "../cryptoJs.js";
export default async () => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    try {
      const messages = await MessageModel.find().select("_id user message");
      for (let i = 0; i < messages.length; i++) {
        const user = await UserModel.findById(messages[i].user);
        await MessageModel.findByIdAndUpdate(messages[i]._id, {
          message: encryptData(messages[i].message, user.apiKey),
        });
      }

      const templates = await TemplateModel.find().select("_id userID message");
      for (let i = 0; i < templates.length; i++) {
        const user = await UserModel.findById(templates[i].userID);
        await TemplateModel.findByIdAndUpdate(templates[i]._id, {
          message: encryptData(templates[i].message, user.apiKey),
        });
      }

      resolve(true);
    } catch (e) {
      reject(e);
    }
  });
};
