import UserModel from "../../models/user.model.js";
import activity from "../../utilities/activity.js";
import UserDetailModel from "../../models/userDetail.model.js";

export default async (req, res, next) => {
  try {
    const user = await UserModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    })
      .populate({
        path: "subscription",
        populate: {
          path: "planID",
        },
      })
      .populate("userDetail");
    if (req.body.address) {
      await UserDetailModel.findOneAndUpdate(
        { user: user._id },
        { address: req.body.address }
      );
    }
    await activity(req, `แก้ไขข้อมูลผู้ใช้ของ ${user.email}`);
    res.json({
      success: true,
      data: user,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};
