import DeviceModel from "../models/device.model.js";
import MessageModel from "../models/message.model.js";
import UssdModel from "../models/ussd.model.js";
import activity from "../utilities/activity.js";
import autoSendMessage from "../utilities/autoSendMessage.js";
const allDevice = async (req, res, next) => {
  try {
    // console.log(req.user);
    let devices;
    if (req.user.isAdmin === 1) {
      const { id } = req.query;
      let query = {};
      if (id !== "All") {
        query.user = id;
      }
      devices = await DeviceModel.find(query);
    } else {
      devices = await DeviceModel.find({ user: req.user._id });
    }
    res.json({
      success: true,
      data: devices,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

const deleteDevice = async (req, res, next) => {
  try {
    //  console.log(req.user);
    const { selectedDevice } = req.body;
    await DeviceModel.updateMany(
      { ID: { $in: selectedDevice } },
      { available: false, enabled: 0 }
    );
    for (let i = 0; i < selectedDevice.length; i++) {
      const device = await DeviceModel.findOne({ ID: selectedDevice[i] });
      await MessageModel.deleteMany({ device: device._id });
      await UssdModel.deleteMany({ deviceID: device._id });
    }
    const devices = await DeviceModel.find();
    await activity(req, "ลบอุปกรณ์");
    res.json({
      success: true,
      data: devices,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

const findDeviceById = async (req, res, next) => {
  try {
    const device = await DeviceModel.findOne({
      user: req.user._id,
      _id: req.params.id,
    });
    if (!device) {
      throw new Error("Device not found");
    }
    res.json({
      success: true,
      data: device,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

const updateDeviceById = async (req, res, next) => {
  try {
    const device = await DeviceModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!device) {
      throw new Error("Device not found");
    }
    await activity(req, "แก้ไขอุปกรณ์");
    res.json({
      success: true,
      data: device,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

const countMessageByDevice = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: await MessageModel.countDocuments({ device: req.body.device }),
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

const motivate = async (req, res, next) => {
  try {
    await MessageModel.updateMany(
      { user: req.user._id, status: "Queued" },
      { status: "Pending" }
    );
    autoSendMessage(req.app.io, "Pending", req.user._id);
    await activity(req, "สั่งกระตุ้นข้อความ");
    const timer = setTimeout(() => {
      clearTimeout(timer);
      res.json({
        success: true,
        data: null,
        error: null,
      });
    }, 1500);
  } catch (e) {
    next(e);
  }
};

export default {
  allDevice,
  deleteDevice,
  findDeviceById,
  updateDeviceById,
  countMessageByDevice,
  motivate,
};
