import moment from "moment";
import UssdAutoModel from "../../models/ussdAuto.js";
import DeviceModel from "../../models/device.model.js";
import UssdModel from "../../models/ussd.model.js";
import processUssdRequest from "../../utilities/send-ussd.js";
import activity from "../../utilities/activity.js";

export default async (req, res, next) => {
  try {
    const result = await UssdAutoModel.create({
      user: req.user._id,
      ...req.body,
      date: new Date(),
      status: "pending",
    });
    if (req.body.schedule) {
      const present = moment();
      const timeForSend = moment(req.body.schedule);
      if (timeForSend < present) {
        throw new Error(
          "The schedule time must be greater than the current time."
        );
      }
      const minute = timeForSend.diff(present, "minutes");
      const secondForSchedule = minute * 60 * 1000;
      waitTimeForSend(result, secondForSchedule, req, next);
    } else {
      if (result.times > 1) {
        sendManyTimes(result, req, next);
      } else {
        await sendUssdRequest(result, 1, next);
        result.status = "success";
        await result.save();
      }
    }
    await result.populate("device", "name model sims");
    await activity(
      req.user._id,
      "สร้างรายการส่งข้อความอัตโนมัติ " + result.request
    );
    res.status(201).json({
      success: true,
      data: result,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

const waitTimeForSend = (ussdAuto, timeout, req, next) => {
  try {
    const timer = setTimeout(async () => {
      if (ussdAuto.times > 1) {
        sendManyTimes(ussdAuto, req, next);
      } else {
        await sendUssdRequest(ussdAuto, 1, next);
        ussdAuto.status = "success";
        await ussdAuto.save();
      }
      req.app.io.emit("updateUssdAuto", ussdAuto);
      clearTimeout(timer);
    }, timeout);
  } catch (e) {
    next(e);
  }
};

const sendUssdRequest = async (ussdAuto, seconds, next) => {
  try {
    const device = await DeviceModel.findById(ussdAuto.device);
    const ussd = await UssdModel.create({
      request: ussdAuto.request,
      userID: ussdAuto.user,
      deviceID: ussdAuto.device,
      simSlot: ussdAuto.simSlot,
      ID: device.maxUssd + 1,
      sendDate: new Date(),
    });

    device.maxUssd += 1;
    await device.save();

    const data = {
      ussdId: ussd.ID,
      ussdRequest: ussd.request,
      simSlot: ussd.simSlot,
    };
    const res = await processUssdRequest(device.token, data);
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        resolve(res);
        clearTimeout(timer);
      }, seconds * 1000);
    });
  } catch (e) {
    next(e);
  }
};

const sendManyTimes = async (ussdAuto, req, next) => {
  try {
    for (let i = 0; i < ussdAuto.times; i++) {
      await sendUssdRequest(ussdAuto, ussdAuto.timer, next);
      if (i === ussdAuto.times - 1) {
        ussdAuto.status = "success";
        await ussdAuto.save();
      } else {
        ussdAuto.status = "No. " + (i + 1) + " success";
        await ussdAuto.save();
      }
      req.app.io.emit("updateUssdAuto", ussdAuto);
    }
  } catch (e) {
    next(e);
  }
};
