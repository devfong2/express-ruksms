import UserModel from "../../models/user.model.js";
import activity from "../../utilities/activity.js";

export default async (req, res, next) => {
  try {
    const user = await UserModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    await activity(req.user._id, `แก้ไขข้อมูลผู้ใช้ของ ${user.email}`);
    res.json({
      success: true,
      data: user,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};
