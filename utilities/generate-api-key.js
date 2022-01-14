import UserModel from "./../models/ussd.model.js";
const generateApiKey = async (length) => {
  let apiKey = randomApiKey(length);
  let userWithApiKey = await UserModel.findOne({ apiKey });
  while (userWithApiKey) {
    apiKey = randomApiKey(length);
    userWithApiKey = await UserModel.findOne({ apiKey });
  }
  // eslint-disable-next-line no-unused-vars
  return new Promise((resolve, reject) => {
    resolve(apiKey);
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
