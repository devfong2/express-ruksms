import DeviceModel from "../models/device.model.js";

const allDevice = async (req, res, next) => {
  try {
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
