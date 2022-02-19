import UssdAutoModel from "../../models/ussdAuto.model.js";
import activity from "../../utilities/activity.js";
export default async (req, res, next) => {
  try {
    const { idForDelete, page } = req.body;
    await UssdAutoModel.deleteMany({ _id: { $in: idForDelete } });
    let ussdAuto;
    let newPage = page;
    if (page > 0) {
      ussdAuto = await UssdAutoModel.find({ user: req.user._id })
        .populate("device", "name model sims")
        .sort({
          date: -1,
        })
        .limit(15)
        .skip(page * 15);
      if (ussdAuto.length === 0) {
        newPage = page - 1;
        ussdAuto = await UssdAutoModel.find({ user: req.user._id })
          .populate("device", "name model sims")
          .sort({
            date: -1,
          })
          .limit(15)
          .skip(newPage * 15);
      }
    } else {
      ussdAuto = await UssdAutoModel.find({ user: req.user._id })
        .populate("device", "name model sims")
        .sort({
          date: -1,
        })
        .limit(15)
        .skip(page * 15);
    }
    const totalItems = await UssdAutoModel.find({
      user: req.user._id,
    }).countDocuments();
    await activity(
      req.user._id,
      "ลบรายการส่งข้อความอัตโนมัติ " + idForDelete.length + " รายการ"
    );
    res.json({
      success: true,
      data: { ussdAuto, newPage, totalItems },
      error: null,
    });
  } catch (e) {
    next(e);
  }
};
