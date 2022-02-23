import userDetailModel from "../../models/userDetail.model.js";
export default async (req, res, next) => {
  try {
    const result = await userDetailModel.findOneAndUpdate(
      { user: req.params.id },
      { ...req.body },
      { new: true }
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
