import ActivityModel from "../models/activity.model.js";

export default (req, activity) => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    try {
      await ActivityModel.create({
        user: req.user._id,
        activity,
        date: new Date(),
        ipAddress:
          req.headers["x-forwarded-for"] || req.connection.remoteAddress,
      });
      resolve(true);
    } catch (e) {
      reject(e);
    }
  });
};
