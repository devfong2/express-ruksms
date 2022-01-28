// eslint-disable-next-line no-undef
const nodeEnv = process.env.NODE_ENV;
export default {
  PORT: 4000,
  PUBLIC_URL: "http://localhost:4000/",
  MONGODB: {
    URI:
      nodeEnv === "production"
        ? "mongodb://node25890-express-ruksms.th.app.ruk-com.cloud:27017/ruksms"
        : "mongodb://node25890-express-ruksms.th.app.ruk-com.cloud:11185/ruksms",
    PASSWORD: "MLHiho08137",
    USERNAME: "admin",
  },

  GATEWAY: {
    FCM: "https://fcm.googleapis.com/fcm/send",
    KEY: "key=AAAAA5KQ65k:APA91bGiFqJd1eQjYjAwAzhWyWGITNzqFbQBf52LlDoftKDZ94f86m1u-KIoEuZFfX-zNRvOifWVV_golBw7Aa-Fq7Cv0qHuIgxGianL1x_BfsjMLlDfQ3cb6fggNiaUQXqdfvTJ_-CL",
    SENDER_ID: "15343872921",
    PURCHASE_CODE: "186f9717-5424-4af6-844d-be7de0a78275",
    // API_KEY: "102ce2f62b5bec8dbbb1eb27c84326074c70d3f1",
  },
  JWT_SECRET:
    "iOAH3bUMfM7O9lffAt1pYUv92bwSgmf9U451VbSC4dWPv9V50ui4HtVjHHKKnrJL7qMAPUJmKbiZ3HlNSvCCTNdGxHshtsriUb5QU0fKrhU6x8ezzqASxHya0kWaPL6Dnxppqn7fU1yn8fpvuaTkPG18pPRDY1tv5sBEqGuTHE0T2paugJsdk0QdG4XOHSENbqcJDwgRhhET7li3jKHcPx4Qvwt6P2LfQAIW1EvnjXYdF8HjMPxA42s1bLGNWmud",
  IO_CORS:
    nodeEnv === "production"
      ? "https://demo1.ruksms.com"
      : "http://localhost:3000",
};
