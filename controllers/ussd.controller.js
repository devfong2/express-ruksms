// import escapeStringRegexp from "escape-string-regexp";
import processUssdRequest from "../utilities/send-ussd.js";
import UssdModel from "../models/ussd.model.js";
import DeviceModel from "../models/device.model.js";
import checkDeviceBeforeSend from "../utilities/check-device-before-send.js";
import activity from "../utilities/activity.js";
// import SettingModel from "../models/setting.model.js";

const sendUssdRequest = async (req, res, next) => {
  try {
    // console.log("ussdCon.js");
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
    await activity(req, "ส่งรหัส USSD");
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
    let totalItems = 0;
    const { id, page } = req.query;
    // console.log(page);
    if (req.user.isAdmin === 1) {
      if (id === "all") {
        ussds = await UssdModel.find()
          .populate("deviceID")
          .populate("userID")
          .limit(15)
          .skip(page * 15)
          .sort({ sendDate: -1 });
        totalItems = await UssdModel.find().count();
      } else {
        ussds = await UssdModel.find({ userID: id })
          .populate("deviceID")
          .populate("userID")
          .limit(15)
          .skip(page * 15)
          .sort({ sendDate: -1 });
        totalItems = await UssdModel.find({ userID: id }).count();
      }
    } else {
      ussds = await UssdModel.find({ userID: req.user._id })
        .populate("deviceID")
        .populate("userID")
        .limit(15)
        .skip(page * 15)
        .sort({ sendDate: -1 });
      totalItems = await UssdModel.find({ userID: req.user._id }).count();
    }
    res.json({
      success: true,
      data: { ussds, totalItems },
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

const deleteUssd = async (req, res, next) => {
  try {
    const { selectedUssd, page } = req.body;
    if (req.user.isAdmin === 1) {
      await UssdModel.deleteMany({
        _id: { $in: selectedUssd },
      });
    } else {
      await UssdModel.deleteMany({
        _id: { $in: selectedUssd },
        userID: req.user._id,
      });
    }
    let ussds = [];
    if (page) {
      ussds = await UssdModel.find({ userID: req.user._id })
        .populate("deviceID")
        .populate("userID")
        .limit(15)
        .skip(page * 15)
        .sort({ sendDate: -1 });
    } else {
      ussds = await UssdModel.find({ userID: req.user._id })
        .populate("deviceID")
        .populate("userID")
        .sort({ sendDate: -1 });
    }
    await activity(req, "ลบข้อมูลการส่งรหัส USSD");
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
    // console.log(result);
    await activity(req, "ส่งรหัส USSD หลายรายการ");
    res.json({
      success: true,
      data: result,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

const startSendPendingUssd = async (req, res, next) => {
  try {
    manageSendUssdManyRequest(req);

    res.json({
      success: true,
      data: null,
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
    }).limit(5);
    while (pendingUssd.length !== 0) {
      const device = await DeviceModel.findById(pendingUssd[0].deviceID);
      // * นำ pendingUssd Array[0] มาส่งข้อความที่ละชุด จนกว่า "รอดำเนินการ" จะหมด
      // รอส่งข้อความ ส่งแล้วสถานะเปลี่ยน
      await setTimeOutToSendUssd(device.token, pendingUssd[0], req);

      //เช็คใหม่
      pendingUssd = await UssdModel.find({
        userID: req.user._id,
        response: "รอดำเนินการ",
      }).limit(5);
      // console.log(pendingUssd.length);
    }
  } catch (e) {
    console.error(e);
  }
};

const setTimeOutToSendUssd = async (deviceToken, pendingUssdZero, req) => {
  const seconds = req.user.delay * 1000;
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    try {
      const data = {
        ussdId: pendingUssdZero.ID,
        ussdRequest: pendingUssdZero.request,
        simSlot: pendingUssdZero.simSlot,
      };
      //ส่งแล้วก้อเปลี่ยนสถานะ
      await UssdModel.findByIdAndUpdate(
        pendingUssdZero._id,
        {
          response: "รอผลตอบกลับ",
        },
        { new: true } // new เพื่อให้รับข้อมูลชุดใหม่ (แก้ปัญหาการจำค่าเดิม)
      );
      // ส่งข้อมูลไปส่ง ussd ให้กับโทรศัพท์
      const res = await processUssdRequest(deviceToken, data);
      const timer = setTimeout(() => {
        resolve(res);
        clearTimeout(timer);
      }, seconds);
    } catch (e) {
      reject(e);
      console.error(e);
    }
  });
};

const ussdForCheckCarrier = async (req, res, next) => {
  try {
    const { carrier } = req.query;
    let start = /727/;
    let startWith = "*933*";
    switch (carrier) {
      case "AIS":
        start = /727/;
        startWith = "*727*";
        break;
      case "D-TAC":
        start = /102/;
        startWith = "*102*";
        break;
      case "TRUEMOVE-H":
        start = /933/;
        startWith = "*933*";
        break;
    }
    const ussds = await UssdModel.find({
      userID: req.user._id,
      request: start,
    });
    const ussds2 = [];
    ussds.map((u) => {
      if (u.request.includes(startWith)) {
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
  startSendPendingUssd,
};
