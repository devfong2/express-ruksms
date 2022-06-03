import ActivityModel from "../models/activity.model.js";
import geoip from "geoip-lite";

export default (req, activity) => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    try {
      const ip =
        req.headers["x-forwarded-for"] ||
        req.ip ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress ||
        "ip address not detected";

      await ActivityModel.create({
        user: req.user._id,
        activity,
        date: new Date(),
        ipAddress: ip.split(",")[0],
        ipAddressDetail: geoip.lookup(ip.split(",")[0]),
      });
      resolve(true);
    } catch (e) {
      reject(e);
    }
  });
};
