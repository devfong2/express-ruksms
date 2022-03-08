import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import axios from "axios";
import handlebars from "handlebars";
import UserModel from "../../models/user.model.js";
import PlanModel from "../../models/plan.model.js";
import SubscriptionModel from "../../models/subscription.model.js";
import sendMail from "../../utilities/send-mail.js";
import activity from "../../utilities/activity.js";
import config from "../../config/index.js";
import SettingModel from "../../models/setting.model.js";

export default async (req, res, next) => {
  try {
    const { paymentSecurity } = req.body;
    if (!paymentSecurity) {
      const err = new Error("invalid payment security");
      err.statusCode = 402;
      throw err;
    }
    const decode = jwt.verify(paymentSecurity, config.JWT_SECRET);
    const {
      referenceNo,
      gbpReferenceNo,
      customerEmail,
      detail,
      paymentType,
      amount,
    } = decode;
    // console.log(decode);

    const checkRefHis = await SubscriptionModel.findOne({ referenceNo });
    if (checkRefHis) {
      throw new Error("Reference Number already exist");
    }

    const plan = await PlanModel.findById(detail);
    const user = await UserModel.findOne({ email: customerEmail });
    if (!plan) {
      throw new Error("Plan not found");
    }
    if (!user) {
      throw new Error("User not found");
    }

    let day = 0;
    switch (plan.frequencyUnit) {
      case "Day":
        day = plan.frequency * 1;
        break;
      case "Week":
        day = plan.frequency * 7;
        break;
      case "Month":
        day = plan.frequency * 30;
        break;
      case "Year":
        day = plan.frequency * 365;
    }

    const subscription = await SubscriptionModel.create({
      planID: plan._id,
      userID: user._id,
      expiryDate: new Date().setDate(new Date().getDate() + day),
      gbpReferenceNo,
      referenceNo,
      paymentMethod: findPaymentMethod(paymentType),
      amount,
    });
    if (user.credits !== null) {
      if (plan.credits !== null) {
        user.credits += plan.credits;
      } else {
        user.credits = plan.credits;
      }
    } else {
      user.credits = plan.credits;
    }
    user.contactsLimit = plan.contacts;
    user.devicesLimit = plan.devices;
    user.sortPhone = plan.sortPhone;
    user.expiryDate = new Date().setDate(new Date().getDate() + day);
    user.subscription = subscription._id;
    await user.save();
    sendMailPaymentSuccess(user, plan, amount);
    req.user = { _id: user._id };
    await activity(
      req,
      `ชำระเงิน ${plan.name} สำเร็จ และเปลี่ยนเป็น ${plan.name} แล้ว`
    );

    res.json({
      success: true,
      data: null,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};
const sendMailPaymentSuccess = async (user, plan, amount) => {
  const line = await SettingModel.findOne({ name: "lineNotify" });
  await axios({
    method: "post",
    url: "https://notify-api.line.me/api/notify",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Bearer ${line.value}`,
    },
    data:
      "message=" +
      `ชำระเงินสำเร็จ \n  ชื่อสมาชิก : ${user.name} \n  อีเมล : ${user.email} \n จำนวนเงิน : ${amount} บาท \n แพ็กเกจ : ${plan.name} `,
  });
  const html = fs.readFileSync(
    path.join(path.resolve(), "email/userLimitsUpdate.html"),
    {
      encoding: "utf-8",
    }
  );
  const template = handlebars.compile(html);
  const replacements = {
    user: user.name,
    credits: user.credits,
    devices: user.devicesLimit,
    contacts: user.contactsLimit,
    expiryDate: new Date(user.expiryDate).toLocaleString("default", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  };
  const htmlToSend = template(replacements);
  // console.log(html);

  await sendMail("Upgrade account success 💰", user.email, htmlToSend);
};

const findPaymentMethod = (type) => {
  let result = "";
  switch (type) {
    case "C":
      result = "Credit Card Full payment";
      break;
    case "R":
      result = "Recurring";
      break;
    case "I":
      result = "Credit Card Installment";
      break;
    case "Q":
      result = "Qr Cash";
      break;
    case "B":
      result = "Bill Payment";
      break;
    case "W":
      result = "Wechat";
      break;
    case "L":
      result = "Line Payment";
      break;
    case "T":
      result = "True Wallet";
      break;
    case "M":
      result = "Mobile Banking";
      break;
    case "D":
      result = "Direct Debit";
      break;
  }
  return result;
};
