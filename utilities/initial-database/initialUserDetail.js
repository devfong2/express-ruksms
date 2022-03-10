// import UserModel from "../../models/user.model.js";
import UserDetailModel from "../../models/userDetail.model.js";

export default async () => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    try {
      const usersDetail = await UserDetailModel.find().select("user");
      for (let i = 0; i < usersDetail.length; i++) {
        const user = await (
          await UserDetailModel.findOne({ user: usersDetail[i].user })
        ).populate("user", "name");
        // console.log(user);
        if (!user.user) {
          await UserDetailModel.findByIdAndDelete(user._id);
        }
      }

      resolve(true);
    } catch (e) {
      reject(e);
    }
  });
};
