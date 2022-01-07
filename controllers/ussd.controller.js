import processUssdRequest from "../utilities/send-ussd.js";
import createID from "../utilities/create-id.js";
import UssdModel from "../models/ussd.model.js";
import DeviceModel from "../models/device.model.js";

const sendUssdRequest = async (req, res, next) => {
  try {
    const device = await DeviceModel.findById(req.body.deviceID);
    if (!device) {
      throw new Error("ไม่พบข้อมูลอุปกรณ์");
    }

    if (device.enabled === 0) {
      throw new Error("การเชื่อมต่อของอุปกรณ์ขาดหาย");
    }
    // console.log(device);
    const deviceToken = device.token;

    const ussds = await UssdModel.find();
    const ID = await createID(ussds);
    const ussd = new UssdModel({
      ...req.body,
      ID,
      sendDate: new Date(),
    });
    await ussd.save();
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

export default {
  sendUssdRequest,
  allUssd,
  deleteUssd,
};
