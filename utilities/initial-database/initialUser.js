import UserModel from "../../models/user.model.js";
import generateApiKey from "../generate-api-key.js";
import { hashPassword } from "../password.js";
export default () => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    try {
      const users = await UserModel.find();
      if (users.length === 0) {
        await UserModel.create({
          ID: 1,
          name: "ADMIN RUKSMS",
          email: "admin@ruksms.com",
          password: await hashPassword("@@RUKSMS12345@@"),
          isAdmin: 1,
          apiKey: await generateApiKey(40),
        });
      }
      resolve(true);
    } catch (e) {
      reject(e);
    }
  });
};
