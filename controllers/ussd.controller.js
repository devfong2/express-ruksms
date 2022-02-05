import processUssdRequest from "../utilities/send-ussd.js";
import UssdModel from "../models/ussd.model.js";
import DeviceModel from "../models/device.model.js";
import checkDeviceBeforeSend from "../utilities/check-device-before-send.js";
// import SettingModel from "../models/setting.model.js";

const sendUssdRequest = async (req, res, next) => {
  try {
    const device = await DeviceModel.findById(req.body.deviceID);
    await checkDeviceBeforeSend(device, req.body.simSlot);
    // console.log(device);
    const deviceToken = device.token;

    const ussd = new UssdModel({
      ...req.body,
      ID: device.maxUssd + 1,
      sendDate: new Date(),
    });
    await ussd.save();

    await DeviceModel.findByIdAndUpdate(device._id, { maxUssd: ussd.ID });
    // console.log(ussd);
    const data = {
      ussdId: ussd.ID,
      ussdRequest: req.body.request,
      simSlot: req.body.simSlot,
    };
    await processUssdRequest(deviceToken, data);
    await ussd.populate("deviceID");
    await ussd.populate("userID");
    // changeUssdStatus(ussd, req);
    res.json({
      success: true,
      data: ussd,
      error: null,
    });
  } catch (e) {
    console.log(e);
    next(e);
  }
};

const allUssd = async (req, res, next) => {
  try {
    let ussds = [];
    if (req.params.id === "all") {
      ussds = await UssdModel.find().populate("deviceID").populate("userID");
    } else {
      ussds = await UssdModel.find({ userID: req.params.id })
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
    const { selectedUssd } = req.body;
    await UssdModel.deleteMany({
      _id: { $in: selectedUssd },
      userID: req.user._id,
    });

    const ussds = await UssdModel.find({ userID: req.user._id })
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
    const { manyUssd } = req.body;
    const device = await DeviceModel.findById(manyUssd[0].deviceID);

    await checkDeviceBeforeSend(device, manyUssd[0].simSlot);

    const result = await UssdModel.insertMany(manyUssd);

    res.json({
      success: true,
      data: result,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

const getPendingUssd = async (req, res, next) => {
  try {
    const result = await UssdModel.find({
      userID: req.user._id,
      response: "รอดำเนินการ",
    })
      .populate("deviceID")
      .populate("userID");
    manageSendUssdManyRequest(req);

    res.json({
      success: true,
      data: result,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

const manageSendUssdManyRequest = async (req) => {
  try {
    let pendingUssd = await UssdModel.find({
      userID: req.user._id,
      response: "รอดำเนินการ",
    }).limit(10);
    while (pendingUssd.length !== 0) {
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
      pendingUssd = await UssdModel.find({
        userID: req.user._id,
        response: "รอดำเนินการ",
      }).limit(10);
      // console.log(pendingUssd.length);
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

const ussdForCheckCarrier = async (req, res, next) => {
  try {
    const ussds = await UssdModel.find({ userID: req.user._id }).populate(
      "deviceID"
    );
    const ussds2 = [];
    ussds.map((u) => {
      if (u.request.includes("*933*")) {
        ussds2.push(u);
      }
      return u;
    });
    res.json({
      success: true,
      data: ussds2,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

export default {
  sendUssdRequest,
  allUssd,
  deleteUssd,
  sendUssdManyRequest,
  ussdForCheckCarrier,
  getPendingUssd,
};
