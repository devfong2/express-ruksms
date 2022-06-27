import * as dotenv from "dotenv";

dotenv.config();

// eslint-disable-next-line no-undef
const env = process.env;
export default {
  PORT: 4000,
  MONGODB: {
    // *important: use your own mongodb url
    URI: env.MONGO_URI,
    PASSWORD: env.MONGO_PASSWORD,
    USERNAME: env.MONGO_USERNAME,
  },
  GATEWAY: {
    FCM: env.GOOGLE_FCM,
    KEY: env.GOOGLE_KEY,
    SENDER_ID: env.GOOGLE_SENDER_ID,
    PURCHASE_CODE: env.RBSOFT_PURCHASE_CODE,
  },
  JWT_SECRET: env.JWT_SECRET,
  // *important: use your website url
  IO_CORS: env.SOCKET_IO_CORS,
  GOOGLE_RECAPTCHA_SECRET_KEY: env.GOOGLE_RECAPTCHA_SECRET_KEY,
  SERVER_URL: "https://api.ruksms.com",
  DATA_SECRET: env.DATA_SECRET,
  PIN: env.PIN,
  PAYMENT_SECRET: env.PAYMENT_SECRET,
  PAYMENT_KEY: env.PAYMENT_KEY,
};
