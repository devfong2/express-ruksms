import DeviceModel from "../models/device.model.js";
import MessageModel from "../models/message.model.js";

const allDevice = async (req, res, next) => {
  try {
    // console.log(req.user);
    let devices;
    if (req.user.isAdmin === 1) {
      devices = await DeviceModel.find();
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
    }
    const devices = await DeviceModel.find();
    res.json({
      success: true,
      data: devices,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

export default { allDevice, deleteDevice };
