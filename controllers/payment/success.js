import UserModel from "../../models/user.model.js";

export default async (req, res, next) => {
  try {
    const { referenceNo, customerEmail } = req.body;
    const user = await UserModel.findOne({ email: customerEmail });
    if (!user) {
      throw new Error("User not found");
    }

    req.app.io.emit("paymentSuccess", {
      userId: user._id,
      referenceNo,
    });

    res.json({
      success: true,
      data: null,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};
