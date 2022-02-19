import UssdAutoModel from "../../models/ussdAuto.model.js";
export default async (req, res, next) => {
  try {
    let ussdAuto;
    let totalItems;
    const { page } = req.query;
    if (req.user.isAdmin === 1) {
      ussdAuto = await UssdAutoModel.find({ user: req.query.id })
        .populate("device", "name model sims")
        .sort({
          date: -1,
        })
        .limit(15)
        .skip(page * 15);
      totalItems = await UssdAutoModel.find({
        user: req.query.id,
      }).countDocuments();
    } else {
      ussdAuto = await UssdAutoModel.find({ user: req.user._id })
        .populate("device", "name model sims")
        .sort({
          date: -1,
        })
        .limit(15)
        .skip(page * 15);
      totalItems = await UssdAutoModel.find({
        user: req.user._id,
      }).countDocuments();
    }
    res.json({
      success: true,
      data: { ussdAuto, totalItems },
      error: null,
    });
  } catch (e) {
    next(e);
  }
};
