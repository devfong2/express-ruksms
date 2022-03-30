// eslint-disable-next-line no-undef
const nodeEnv = process.env.NODE_ENV;
export default {
  PORT: 4000,
  MONGODB: {
    URI:
      nodeEnv === "production"
        ? "mongodb://node25890-express-ruksms.proen.app.ruk-com.cloud:27017/ruksms"
        : "mongodb://node25890-express-ruksms.proen.app.ruk-com.cloud:11185/ruksms-dev",
    PASSWORD: "MLHiho08137",
    USERNAME: "admin",
  },
  GATEWAY: {
    FCM: "https://fcm.googleapis.com/fcm/send",
    KEY: "key=AAAAA5KQ65k:APA91bGiFqJd1eQjYjAwAzhWyWGITNzqFbQBf52LlDoftKDZ94f86m1u-KIoEuZFfX-zNRvOifWVV_golBw7Aa-Fq7Cv0qHuIgxGianL1x_BfsjMLlDfQ3cb6fggNiaUQXqdfvTJ_-CL",
    SENDER_ID: "15343872921",
    PURCHASE_CODE: "186f9717-5424-4af6-844d-be7de0a78275",
  },
  JWT_SECRET:
    "iOAH3bUMfM7O9lffAt1pYUv92bwSgmf9U451VbSC4dWPv9V50ui4HtVjHHKKnrJL7qMAPUJmKbiZ3HlNSvCCTNdGxHshtsriUb5QU0fKrhU6x8ezzqASxHya0kWaPL6Dnxppqn7fU1yn8fpvuaTkPG18pPRDY1tv5sBEqGuTHE0T2paugJsdk0QdG4XOHSENbqcJDwgRhhET7li3jKHcPx4Qvwt6P2LfQAIW1EvnjXYdF8HjMPxA42s1bLGNWmud",
  IO_CORS:
    nodeEnv === "production"
      ? "https://app.ruksms.com"
      : "http://localhost:3000",
  GOOGLE_RECAPTCHA_SECRET_KEY: "6Let_qAeAAAAAIMqddpYlmKnF4seXKPlr2sQgAcv",
  SERVER_URL: "https://api.ruksms.com",
  DATA_SECRET:
    "b00dfbeb31942c813084472c70408a1bb558ac3b90173eafc7fb2c3e7cf16812",
  PIN: "MjU0MTA0MTA=",
  PAYMENT_SECRET:
    "f6323ff032c4f0df07d8b48607840d6d4d964359c2c7d90d7ce38f5b831a9738",
  PAYMENT_KEY: "$2a$10$R8RMOByLGq2GTQyjxzHLOOq6.UWfQ2XPqVYqA5EznVITBoi7YJ98q",
};
