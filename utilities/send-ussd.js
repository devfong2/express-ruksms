import axios from "axios";
import config from "../config/index.js";

//* ส่ง Ussd ไปที่ cloud
const processUssdRequest = (deviceToken, dataRequest) => {
  axios.defaults.baseURL = config.GATEWAY.FCM;
  axios.defaults.headers.common["Authorization"] = config.GATEWAY.KEY;
  // console.log(dataRequest);
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    try {
      const data = {
        to: deviceToken,
        priority: "high",
        data: dataRequest,
      };
      //* axios post data ไปที่ config.GATEWAY.FCM ข้างบน
      const result = await axios.post("", data);
      // const result = await axios({
      //   method: "post",
      //   url: config.GATEWAY.FCM,
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: config.GATEWAY.KEY,
      //   },
      //   data,
      // });

      resolve(result);
    } catch (e) {
      reject(e);
    }
  });
};

export default processUssdRequest;
