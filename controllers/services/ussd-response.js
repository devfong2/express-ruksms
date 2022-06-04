import UssdModel from "../../models/ussd.model.js";
import DeviceModel from "../../models/device.model.js";
import UserModel from "../../models/user.model.js";
import updateDashboard from "../../utilities/update-dashboard.js";

export default async (req, res, next) => {
  try {
    // console.table(req.body);
    const { androidId, userId, ussdId, response } = req.body;
    if (!androidId && !userId && !ussdId && !response) {
      const err = new Error(`Invalid data`);
      err.statusCode = 200;
      throw err;
    }
    const user = await UserModel.findOne({ ID: userId });
    const device = await DeviceModel.findOne({ androidId });
    const ussd = await UssdModel.findOneAndUpdate(
      { ID: req.body.ussdId, deviceID: device._id, userID: user._id },
      {
        response: req.body.response,
        responseDate: new Date().toISOString(),
      },
      { new: true }
    );

    req.user = { _id: ussd.userID };
    await updateDashboard(req);

    res.json({
      success: true,
      data: null,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};
