import axios from "axios";
import config from "../../config/index.js";
import qs from "qs";

const getQrCode = (obj) => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    try {
      const data = {
        token: config.GBPRIME.TOKEN,
        backgroundUrl: config.SERVER_URL,
        ...obj,
      };
      //console.log(config.GBPRIME);
      const data2 = qs.stringify(data);
      const option = {
        method: "post",
        url: (config.GBPRIME.BASE_URL += "/gbp/gateway/qrcode"),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: data2,
      };

      const result = await axios(option);
      //  console.log(JSON.stringify(result.data));

      resolve(result);
    } catch (e) {
      // console.log(e);
      // reject(new Error(e.response.data));
      reject(e);
    }
  });
};
export default getQrCode;
