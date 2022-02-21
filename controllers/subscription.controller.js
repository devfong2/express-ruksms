import fs from "fs";
import path from "path";
import handlebars from "handlebars";
import sendMail from "../utilities/send-mail.js";
import SubscriptionModel from "../models/subscription.model.js";
import PlanModel from "../models/plan.model.js";
import UserModel from "../models/user.model.js";
import activity from "../utilities/activity.js";
const createSubscription = async (req, res, next) => {
  try {
    const { planID, userID } = req.body;
    const plan = await PlanModel.findById(planID);
    const user = await UserModel.findById(userID);
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
      planID,
      userID,
      expiryDate: new Date().setDate(new Date().getDate() + day),
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
    await activity(
      req,
      `เพิ่มแพ็กเกจ ${plan.name} ให้ผู้ใช้ ${user.email}[${user.name}]`
    );
    res.status(201).json({
      success: true,
      data: subscription,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

const allSubscriptions = async (req, res, next) => {
  try {
    if (req.user.isAdmin !== 1) {
      const err = new Error("Unauthorized");
      err.statusCode = 401;
      throw err;
    }
    const subscriptions = await SubscriptionModel.find();
    res.status(200).json({
      success: true,
      data: subscriptions,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

export default { createSubscription, allSubscriptions };
