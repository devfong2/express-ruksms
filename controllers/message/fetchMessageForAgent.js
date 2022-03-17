import MessageModel from "../../models/message.model.js";

export default async (req, res, next) => {
  try {
    const messages = await MessageModel.find({
      _id: { $in: req.body.ids },
    }).select(req.body.select);
    res.status(200).json({
      success: true,
      data: messages,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};
