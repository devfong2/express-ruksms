import UserModel from "./../models/user.model.js";
import MessageModel from "./../models/message.model.js";
const generateApiKey = async (length) => {
  let apiKey = randomApiKey(length);
  let userWithApiKey = await UserModel.findOne({ apiKey });
  // console.log(userWithApiKey);
  while (userWithApiKey) {
    apiKey = randomApiKey(length);
    userWithApiKey = await UserModel.findOne({ apiKey });
  }
  // eslint-disable-next-line no-unused-vars
  return new Promise((resolve, reject) => {
    resolve(apiKey);
  });
};

export const generateGroupID = async (length) => {
  let groupID = randomApiKey(length);
  let messageWithGroupID = await MessageModel.find({ groupID });
  while (messageWithGroupID.length !== 0) {
    groupID = randomApiKey(length);
    messageWithGroupID = await MessageModel.find({ groupID });
  }
  // eslint-disable-next-line no-unused-vars
  return new Promise((resolve, reject) => {
    resolve(groupID);
  });
};

const randomApiKey = (length) => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export default generateApiKey;
