import DeviceModel from "../../models/device.model.js";
export default async (req, res) => {
  // console.log(req.body);
  const { androidId, userId } = req.body;
  // console.table(req.body);
  if (!androidId && !userId) {
    const err = new Error(`Invalid data`);
    err.statusCode = 200;
    throw err;
  }
  const device = await DeviceModel.findOneAndUpdate(
    { androidId: req.body.androidId },
    { enabled: 0 }
  );
  // console.log(device);
  req.app.io.emit("updateDevice", {
    userId: device.user,
    type: "signOut",
    androidId: req.body.androidId,
  });
  res.json({
    success: true,
    data: null,
    error: null,
  });
};
