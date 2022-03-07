import axios from "axios";
import config from "../../config/index.js ";
export default (referenceNo) => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    try {
      // eslint-disable-next-line no-undef
      const end = Buffer.from(config.GBPRIME.SECRET_KEY + ":").toString(
        "base64"
      );
      const option = {
        method: "post",
        url: (config.GBPRIME.BASE_URL += "/v1/check_status_txn"),
        headers: {
          // eslint-disable-next-line no-undef
          Authorization: `Basic ${end}`,
        },
        data: { referenceNo },
      };
      // console.log(end);
      const result = await axios(option);
      if (result.data.resultCode === "00") {
        // console.log(result.data);
        if (result.data.txns) {
          resolve(result.data.txns[result.data.txns.length - 1]);
        } else if (result.data.txn) {
          resolve(result.data.txn);
        } else reject(result.data.resultMessage);
      } else reject(result.data.resultMessage);
    } catch (e) {
      reject(e);
    }
  });
};
