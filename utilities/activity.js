import ActivityModel from "../models/activity.model.js";
import geoip from "geoip-lite";

export default (req, activity) => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    try {
      const ip =
        req.ip ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

      await ActivityModel.create({
        user: req.user._id,
        activity,
        date: new Date(),
        ipAddress: ip,
        ipAddressDetail: geoip.lookup(ip),
      });
      resolve(true);
    } catch (e) {
      reject(e);
    }
  });
};
