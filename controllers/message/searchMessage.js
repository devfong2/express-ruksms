import MessageModel from "../../models/message.model.js";
export default async (req, res, next) => {
  try {
    const {
      user,
      startDate,
      endDate,
      device,
      status,
      mobileNumber,
      message,
      page,
      itemPerPage,
    } = req.body;
    let query = {
      sentDate: {
        $gte: new Date(startDate),
        $lt: new Date(endDate),
      },
    };
    if (user !== "All") {
      query.user = user;
    }
    if (mobileNumber !== "") {
      query.number = new RegExp(mobileNumber);
    }

    if (message !== "") {
      query.message = new RegExp(message);
    }

    if (status !== "All") {
      query.status = status;
    }

    if (device !== "All") {
      query.device = device;
    }
    // console.log(query);
    let messages;
    let count = 0;
    if (req.user.isAdmin === 1) {
      messages = await MessageModel.find(query)
        .sort({
          sentDate: -1,
        })
        .limit(itemPerPage)
        .skip(page * itemPerPage);
      count = await MessageModel.find(query).countDocuments();
    } else {
      messages = await MessageModel.find(query)
        .sort({
          sentDate: -1,
        })
        .limit(itemPerPage)
        .skip(page * itemPerPage);
      count = await MessageModel.find(query).countDocuments();
    }
    res.json({
      success: true,
      data: { messages, count },
      error: null,
    });
  } catch (e) {
    next(e);
  }
};
