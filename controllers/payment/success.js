import fs from "fs";
import path from "path";
import handlebars from "handlebars";
import axios from "axios";
import config from "../../config/index.js";
import UserModel from "../../models/user.model.js";
import PlanModel from "../../models/plan.model.js";
import SubscriptionModel from "../../models/subscription.model.js";
import { comparePassword } from "../../utilities/password.js";
import sendMail from "../../utilities/send-mail.js";
import activity from "../../utilities/activity.js";
import SettingModel from "../../models/setting.model.js";
import { decryptData } from "../../utilities/cryptoJs.js";

export default async (req, res, next) => {
  try {
    const {
      amount,
      gbpReferenceNo,
      referenceNo,
      customerEmail,
      merchantDefined1,
      merchantDefined2,
      merchantDefined3,
      merchantDefined4,
      merchantDefined5,
      paymentType,
    } = req.body;
    if (
      !amount ||
      !gbpReferenceNo ||
      !referenceNo ||
      !customerEmail ||
      !merchantDefined1 ||
      !merchantDefined2 ||
      !merchantDefined3 ||
      !merchantDefined4 ||
      !merchantDefined5 ||
      !paymentType
    ) {
      throw new Error("Invalid Payment Data");
    }

    const decMer2 = await decryptData(merchantDefined2, config.PAYMENT_SECRET);
    const decMer3 = await decryptData(merchantDefined3, config.PAYMENT_SECRET);
    const decMer4 = await decryptData(merchantDefined4, config.PAYMENT_SECRET);
    const decMer5 = await decryptData(merchantDefined5, config.PAYMENT_SECRET);

    const key = `${decMer2}:${decMer3}:${decMer4}:${decMer5}`;

    const checkKey = await comparePassword(key, config.PAYMENT_KEY);
    if (!checkKey) {
      throw new Error("Invalid Payment Key");
    }
    const user = await UserModel.findOne({ email: customerEmail });
    if (!user) {
      throw new Error("User not found");
    }
    const checkRefHis = await SubscriptionModel.findOne({ referenceNo });
    if (checkRefHis) {
      throw new Error("Reference Number already exist");
    }

    const plan = await PlanModel.findById(merchantDefined1);
    if (!plan) {
      throw new Error("Invalid Plan");
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

    sendMailPaymentSuccess(user, plan, amount, paymentType);
    req.user = { _id: user._id };
    await activity(
      req,
      `ชำระเงิน ${plan.name} สำเร็จ และเปลี่ยนเป็น ${plan.name} แล้ว`
    );

    req.app.io.emit("paymentSuccess", {
      userId: user._id,
      referenceNo,
    });

    res.json({
      success: true,
      data: null,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

const sendMailPaymentSuccess = async (user, plan, amount, paymentType) => {
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
      `ชำระเงินสำเร็จ \nชื่อสมาชิก : ${user.name} \nอีเมล : ${
        user.email
      } \nจำนวนเงิน : ${comma(amount)} บาท \nแพ็กเกจ : ${
        plan.name
      } \nจ่ายโดย : ${findPaymentMethod(paymentType)} `,
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

const comma = (value) => {
  if (!value) return "0";
  const res = parseFloat(value);
  const val = (res / 1).toFixed(2).replace(",", ".");
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
