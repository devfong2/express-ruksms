// import UserModel from "../../models/user.model.js";
import UserDetailModel from "../../models/userDetail.model.js";

export default async () => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    try {
      const usersDetail = await UserDetailModel.find();
      for (let i = 0; i < usersDetail.length; i++) {
        if (!usersDetail[i].offensiveword) {
          await UserDetailModel.findByIdAndUpdate(usersDetail[i]._id, {
            offensiveword: true,
          });
        }
      }

      resolve(true);
    } catch (e) {
      reject(e);
    }
  });
};
