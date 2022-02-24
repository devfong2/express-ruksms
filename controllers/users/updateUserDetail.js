import userDetailModel from "../../models/userDetail.model.js";
import activity from "../../utilities/activity.js";
import UserModel from "../../models/user.model.js";
export default async (req, res, next) => {
  try {
    const { verify, verifyImg, verifyDetail, suspend, suspendDetail } =
      req.body;
    let result;
    const user = await UserModel.findById(req.params.id);
    if (verifyImg) {
      result = await userDetailModel.findOneAndUpdate(
        { user: user._id },
        { verify, verifyImg, verifyDetail },
        { new: true }
      );
      await activity(
        req,
        `แก้ไขข้อมูลการยืนยันตัวตนของผู้ใช้งาน ${user.email} เป็น ${
          verify === 1 ? "ยืนยันตัวตนแล้ว" : "ยังไม่ได้ทำการยืนยันตัวตน"
        }`
      );
    } else {
      result = await userDetailModel.findOneAndUpdate(
        { user: user._id },
        { suspend, suspendDetail },
        { new: true }
      );
      await activity(
        req,
        `แก้ไขข้อมูลระงับผู้ใช้งาน ${user.email} เป็น ${
          suspend === 1 ? "ไม่ระงับผู้ใช้งาน" : "ระงับผู้ใช้งาน"
        }`
      );
    }
    res.json({
      success: true,
      data: result,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};
