export default {
  apps: [
    {
      name: "express-ruksms",
      exec_mode: "cluster",
      instances: "max", // Or a number of instances
      script: "./index.js",
    },
  ],
};
