import UserDetailModel from "../../models/userDetail.model.js";
import activity from "../../utilities/activity.js";
export default async (req, res, next) => {
  try {
    // console.log(req.body.query);
    const result = await UserDetailModel.find(req.body.query).populate(
      "user",
      "-password -ID -webHook -id -subscription -apiKey -language -primaryDeviceID -isAdmin -sleepTime -receivedSmsEmail -smsToEmail -autoRetry -reportDelivery"
    );
    await activity(req, "export excel ข้อมูลสถานะของลูกค้า");
    res.json({
      success: true,
      data: result,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};
