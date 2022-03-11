import CryptoJS from "crypto-js";
import config from "../config/index.js";
export const encryptData = (data, secret) => {
  const encrypt = CryptoJS.AES.encrypt(
    JSON.stringify(data),
    `${config.DATA_SECRET}:${secret}`
  ).toString();
  return encrypt;
};

export const decryptData = (data, secret) => {
  const decrypt = CryptoJS.AES.decrypt(
    data.toString(),
    `${config.DATA_SECRET}:${secret}`
  );
  const result = decrypt.toString(CryptoJS.enc.Utf8);
  return JSON.parse(result);
};
