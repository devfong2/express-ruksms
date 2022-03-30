import messageModel from "../../models/message.model.js";
import { decryptData } from "../../utilities/cryptoJs.js";

const capitalize = (str) => str[0].toUpperCase() + str.slice(1);

export default async (req, res, next) => {
  try {
    const { page, limit, status } = req.query;
    const query = { user: req.user._id };
    // console.log(limit);

    if (status !== "all") {
      query.status = capitalize(status);
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const result = await Promise.all([
      messageModel
        .find(query)
        .select(
          " -expiryDate -_id -retries -user -device -type -attachments -prioritize -customer -__v -groupID -messageLength -perMessage"
        )
        .limit(parseInt(limit))
        .skip(skip),
      messageModel.countDocuments(query),
    ]);
    const maxPage = Math.ceil(result[1] / parseInt(limit));
    if (parseInt(page) > maxPage) {
      throw new Error(`page must be between 1 to ${maxPage}`);
    }
    const preMessage = await decryptMessage(result[0], req.user.apiKey);
    res.status(200).json({
      success: true,
      data: {
        messages: preMessage,
        page: parseInt(page),
        maxPage,
      },
      error: null,
    });
  } catch (e) {
    // console.error(e.message);
    next(e);
  }
};

const decryptMessage = async (messages, userApiKey) => {
  const messages2 = [];
  for (let i = 0; i < messages.length; i++) {
    messages[i].message = await decryptData(messages[i].message, userApiKey);
    messages2.push(messages[i]);
  }

  return Promise.resolve(messages2);
};
