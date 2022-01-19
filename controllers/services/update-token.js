import DeviceModel from "../../models/device.model.js";
export default async (req, res, next) => {
  try {
    console.log(2);
    const { androidId, token } = req.body;
    if (!androidId && !token) {
      const err = new Error(`ข้อมูลที่ส่งมาเกิดความผิดพลาด`);
      err.statusCode = 200;
      throw err;
    }

    const findDeviceByAndroidId = await DeviceModel.findOneAndUpdate(
      { androidId },
      { token },
      { new: true }
    ).populate("user");

    res.json({
      success: true,
      data: findDeviceByAndroidId,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};
