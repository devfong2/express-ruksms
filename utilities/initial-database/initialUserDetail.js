import UserModel from "../../models/user.model.js";
import UserDetailModel from "../../models/userDetail.model.js";

export default async () => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    try {
      const users = await UserModel.find();
      for (let i = 0; i < users.length; i++) {
        const userDetail = await UserDetailModel.findOne({
          user: users[i]._id,
        });
        if (!userDetail) {
          await UserDetailModel.create({
            user: users[i]._id,
            knownFrom: users[i].knownFrom || "เพื่อน",
            verify: users[i].isAdmin === 1 ? 1 : 2,
          });
          const user = await UserModel.findById(users[i]._id);
          user.knownFrom = undefined;
          await user.save();
        }
      }
      resolve(true);
    } catch (e) {
      reject(e);
    }
  });
};
