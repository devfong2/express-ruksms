import userDetailModel from "../../models/userDetail.model.js";

export default async (req, res, next) => {
  try {
    const result = await userDetailModel.find();
    res.json({
      success: true,
      data: result,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};
