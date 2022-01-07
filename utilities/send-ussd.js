import axios from "axios";
import config from "../config/index.js";
axios.defaults.baseURL = config.GATEWAY.FCM;
axios.defaults.headers.common["Authorization"] = config.GATEWAY.KEY;

const processUssdRequest = (deviceToken, dataRequest) => {
  // console.log(dataRequest);
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    try {
      const data = {
        to: deviceToken,
        priority: "high",
        data: dataRequest,
      };
      const result = await axios.post("", data);
      resolve(result);
    } catch (e) {
      reject(e);
    }
  });
};

export default processUssdRequest;
