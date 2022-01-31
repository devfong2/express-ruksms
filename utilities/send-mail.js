import nodemailer from "nodemailer";
// import config from "../config/index.js";
import SettingModel from "../models/setting.model.js";

export default async (title, recipient, html) => {
  const mail = await SettingModel.findOne({ name: "mail" });
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    try {
      let transporter = nodemailer.createTransport({
        host: mail.value.host,
        port: mail.value.port,
        secure: false,
        auth: {
          user: mail.value.user, // generated ethereal user
          pass: mail.value.pass, // generated ethereal password
        },
      });
      const info = await transporter.sendMail({
        from: `${mail.value.from} < ${mail.value.user} >`, // sender address
        to: recipient,
        subject: title,
        html,
      });
      resolve(info);
    } catch (e) {
      reject(e);
    }
  });
};
