import DeviceModel from "../models/device.model.js";

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
    await DeviceModel.updateMany(
      { ID: { $in: req.body.selectedDevice } },
      { available: false, enabled: 0 }
    );
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
