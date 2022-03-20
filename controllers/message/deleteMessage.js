import MessageModel from "../../models/message.model.js";
import activity from "../../utilities/activity.js";
export default async (req, res, next) => {
  try {
    const { idForDelete, user, status, mode, customer } = req.body;
    const query = {};
    if (status !== "All") {
      query.status = status;
    }
    if (customer) {
      query.customer = customer;
    }
    // console.log(query);
    let result;
    if (mode === "selected") {
      result = await MessageModel.deleteMany({ _id: { $in: idForDelete } });
    } else {
      if (req.user.isAdmin === 1) {
        result = await MessageModel.deleteMany({ user, ...query });
      } else {
        result = await MessageModel.deleteMany({
          user: req.user._id,
          ...query,
        });
      }
    }
    if (result.deletedCount === 0) {
      throw new Error("ไม่พบข้อความที่ต้องการลบ");
    }
    // console.log(result);

    await activity(
      req,
      `ลบข้อความ ${mode}-${status} จำนวน ${result.deletedCount} ข้อความ`
    );
    res.json({
      success: true,
      data: null,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};
