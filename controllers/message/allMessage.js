import MessageModel from "../../models/message.model.js";
export default async (req, res, next) => {
  try {
    const { user, status } = req.body;
    let query = {};
    if (user !== "All") {
      query.user = user;
    }

    if (status !== "All") {
      query.status = status;
    }

    // console.log(query);
    let messages;
    if (req.user.isAdmin === 1) {
      messages = await MessageModel.find(query).select(
        "ID number message schedule sentDate deliveredDate status simSlot -_id"
      );
    } else {
      if (query.user) {
        delete query.user;
      }
      messages = await MessageModel.find({
        user: req.user._id,
        ...query,
      }).select(
        "ID number message schedule sentDate deliveredDate status simSlot -_id"
      );
    }
    res.json({
      success: true,
      data: messages,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};
