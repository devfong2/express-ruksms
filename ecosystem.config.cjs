/* eslint-disable no-undef */
module.exports = {
  apps: [
    {
      name: "express-ruksms",
      exec_mode: "cluster_mode",
      instances: "2", // Or a number of instances
      script: "index.js",
    },
  ],
};