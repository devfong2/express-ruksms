import MessageModel from "../../models/message.model.js";
import UserDetailModel from "../../models/userDetail.model.js";
import DeviceModel from "../../models/device.model.js";

export default async (req, res, next) => {
  try {
    const userDetail = await UserDetailModel.findOne({ user: req.query.user });
    const devices = await DeviceModel.find({
      user: req.query.user,
    }).countDocuments();
    const messages = await MessageModel.find({
      user: req.query.user,
    }).countDocuments();

    res.json({
      success: true,
      data: { userDetail, messages, devices },
      error: null,
    });
  } catch (e) {
    next(e);
  }
};
