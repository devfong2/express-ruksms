import MessageModel from "./../../models/message.model.js";
export default async (req, res, next) => {
  try {
    // console.log("=======get-message=====");
    console.table(req.body);
    const { groupId, limit } = req.body;
    if (!groupId) {
      const err = new Error(`Invalid data`);
      err.statusCode = 200;
      throw err;
    }
    const messages = await MessageModel.find({
      groupID: groupId,
      status: "Pending",
    }).limit(parseInt(limit));
    // console.log(messages);
    // console.log("=======get-message=====");
    const idForUpdate = messages.map((m) => m._id);
    await MessageModel.updateMany(
      {
        _id: { $in: idForUpdate },
        status: "Pending",
      },
      { status: "Queued", sentDate: new Date() }
    );
    res.json({
      success: true,
      data: {
        messages,
        totalCount: messages.length,
      },
      error: null,
    });
  } catch (e) {
    next(e);
  }
};
