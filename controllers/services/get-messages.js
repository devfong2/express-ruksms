import MessageModel from "./../../models/message.model.js";
export default async (req, res, next) => {
  try {
    console.log("=======get-message=====");
    console.table(req.body);
    const { groupId } = req.body;
    const messages = await MessageModel.find({
      groupID: groupId,
      status: "Pending",
    });
    // console.log(messages);
    console.log("=======get-message=====");
    await MessageModel.updateMany(
      {
        groupID: groupId,
        status: "Pending",
      },
      { status: "Sent" }
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
