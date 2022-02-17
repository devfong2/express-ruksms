import ActivityModel from "../models/activity.model.js";

export default (user, activity) => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    try {
      await ActivityModel.create({
        user,
        activity,
        date: new Date(),
      });
      resolve(true);
    } catch (e) {
      reject(e);
    }
  });
};
