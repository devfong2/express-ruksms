import processUssdRequest from "../utilities/send-ussd.js";
import UssdModel from "../models/ussd.model.js";
import DeviceModel from "../models/device.model.js";
import checkDeviceBeforeSend from "../utilities/check-device-before-send.js";
import SettingModel from "../models/setting.model.js";

const sendUssdRequest = async (req, res, next) => {
  try {
    const device = await DeviceModel.findById(req.body.deviceID);
    await checkDeviceBeforeSend(device, req.body.simSlot);
    // console.log(device);
    const deviceToken = device.token;

    // const ussds = await UssdModel.find();
    // const ID = await createID(ussds);
    const maxUssdId = await SettingModel.findOne({ name: "maxUssdId" });
    const ussd = new UssdModel({
      ...req.body,
      ID: maxUssdId.value + 1,
      sendDate: new Date(),
    });
    await ussd.save();
    await SettingModel.findOneAndUpdate(
      { name: "maxUssdId" },
      { value: ussd.ID }
    );
    // console.log(ussd);
    const data = {
      ussdId: ussd.ID,
      ussdRequest: req.body.request,
      simSlot: req.body.simSlot,
    };
    await processUssdRequest(deviceToken, data);
    await ussd.populate("deviceID");
    await ussd.populate("userID");

    res.json({
      success: true,
      data: ussd,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

const allUssd = async (req, res, next) => {
  try {
    let ussds = [];
    if (req.user.isAdmin === 1) {
      ussds = await UssdModel.find().populate("deviceID").populate("userID");
    } else {
      ussds = await UssdModel.find({ userID: req.user._id })
        .populate("deviceID")
        .populate("userID");
    }
    res.json({
      success: true,
      data: ussds,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

const deleteUssd = async (req, res, next) => {
  try {
    await UssdModel.deleteMany({
      ID: { $in: req.body.selectedUssd },
    });
    const ussds = await UssdModel.find()
      .populate("deviceID")
      .populate("userID");
    res.json({
      success: true,
      data: ussds,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

const sendUssdManyRequest = async (req, res, next) => {
  try {
    const { manyUssd, deviceID, simSlot, userID } = req.body;
    const device = await DeviceModel.findById(deviceID);

    await checkDeviceBeforeSend(device, simSlot);

    // console.log(test);
    for (let i = 0; i < manyUssd.length; i++) {
      const maxUssdId = await SettingModel.findOne({ name: "maxUssdId" });
      const ussd = new UssdModel({
        request: manyUssd[i],
        userID: userID,
        deviceID: deviceID,
        simSlot: simSlot,
        ID: maxUssdId.value + 1,
        sendDate: new Date(),
      });
      await ussd.save();
      await SettingModel.findOneAndUpdate(
        { name: "maxUssdId" },
        { value: ussd.ID }
      );
    }
    const result = await UssdModel.find({ userID, response: "รอดำเนินการ" });
    manageSendUssdManyRequest(userID, req);

    res.json({
      success: true,
      data: result,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

const manageSendUssdManyRequest = async (userID, req) => {
  try {
    let pendingUssd = await UssdModel.find({ userID, response: "รอดำเนินการ" });
    while (pendingUssd.length !== 0) {
      // insert to ussd model

      const data = {
        ussdId: pendingUssd[0].ID,
        ussdRequest: pendingUssd[0].request,
        simSlot: pendingUssd[0].simSlot,
      };
      const device = await DeviceModel.findById(pendingUssd[0].deviceID);
      // รอส่งข้อความ
      await setTimeOutToSendUssd(device.token, data);
      //ส่งแล้วก้อเปลี่ยนสถานะ
      const ussd = await UssdModel.findByIdAndUpdate(
        pendingUssd[0]._id,
        {
          response: "รอผลตอบกลับ",
        },
        { new: true }
      );
      req.app.io.emit("updateUssd", ussd);

      //เช็คใหม่
      pendingUssd = await UssdModel.find({ userID, response: "รอดำเนินการ" });
      console.log(pendingUssd.length);
    }
  } catch (e) {
    console.error(e);
  }
};

const setTimeOutToSendUssd = async (deviceToken, data) => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    try {
      const res = await processUssdRequest(deviceToken, data);
      const timer = setTimeout(() => {
        resolve(res);
        clearTimeout(timer);
      }, 1200);
    } catch (e) {
      reject(e);
      console.error(e);
    }
  });
};

export default {
  sendUssdRequest,
  allUssd,
  deleteUssd,
  sendUssdManyRequest,
};
