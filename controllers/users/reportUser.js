import UserDetailModel from "../../models/userDetail.model.js";
export default async (req, res, next) => {
  try {
    // console.log(req.body.query);
    const result = await UserDetailModel.find(req.body.query).populate(
      "user",
      "-password -ID -webHook -id -subscription -apiKey -language -primaryDeviceID -isAdmin -sleepTime -receivedSmsEmail -smsToEmail -autoRetry -reportDelivery"
    );
    res.json({
      success: true,
      data: result,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};
