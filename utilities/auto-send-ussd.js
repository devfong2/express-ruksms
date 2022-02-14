import UssdModel from "../models/ussd.model.js";
import UserModel from "../models/user.model.js";
import DeviceModel from "../models/device.model.js";
import processUssdRequest from "./send-ussd.js";
export default async (io) => {
  try {
    const users = await UserModel.find();
    users.map((user) => senUssd(user, io));
  } catch (e) {
    console.error(e);
  }
};

const senUssd = async (user, io) => {
  try {
    const seconds = user.delay * 1000;
    let pendingUssd = await UssdModel.find({
      response: "รอดำเนินการ",
      userID: user._id,
    }).limit(5);
    while (pendingUssd.length !== 0) {
      const device = await DeviceModel.findById(pendingUssd[0].deviceID);
      // รอส่งข้อความ

      await waitTimeForSendUssd(device.token, pendingUssd[0], io, seconds);

      //เช็คใหม่
      pendingUssd = await UssdModel.find({
        response: "รอดำเนินการ",
        userID: user._id,
      }).limit(5);
      // console.log(pendingUssd.length);
    }
  } catch (e) {
    console.error(e);
  }
};

const waitTimeForSendUssd = (deviceToken, pendingUssdZero, io, seconds) => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    try {
      //ส่งแล้วก้อเปลี่ยนสถานะ
      const ussd = await UssdModel.findByIdAndUpdate(
        pendingUssdZero._id,
        {
          response: "รอผลตอบกลับ",
        },
        { new: true }
      );
      io.emit("updateUssd", ussd);
      const data = {
        ussdId: pendingUssdZero.ID,
        ussdRequest: pendingUssdZero.request,
        simSlot: pendingUssdZero.simSlot,
      };
      const res = await processUssdRequest(deviceToken, data);
      const timer = setTimeout(() => {
        resolve(res);
        clearTimeout(timer);
      }, seconds);
    } catch (e) {
      reject(e);
    }
  });
};
