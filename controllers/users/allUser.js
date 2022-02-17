import UserModel from "../../models/user.model.js";
export default async (req, res, next) => {
  try {
    let users;
    if (req.user.isAdmin === 1) {
      users = await UserModel.find();
    } else {
      users = await UserModel.find({ _id: req.user._id });
    }
    res.json({
      success: true,
      data: users,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};
