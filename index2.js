import express from "express";
import passport from "passport";
import path from "path";
import helmet from "helmet";
import { Server } from "socket.io";
import { createServer } from "http";
import config from "./config/index.js";
import connectDatabase from "./database/index.js";
import errorHandler from "./middlewares/errorHandler.js";
import routesRuksm from "./routes/ruksms/index.js";
import checkScheduleAndSetTimeOut from "./utilities/checkScheduleAndSetTimeOut.js";
import autoSendUssd from "./utilities/auto-send-ussd.js";
import autoSendMessage from "./utilities/autoSendMessage.js";
import initialDatabase from "./utilities/initial-database/index.js";
import notFound from "./middlewares/notFound.js";
import agentRoute from "./routes/agent/index.js";
import apiCheck from "./middlewares/agent/apiCheck.js";
import checkUser from "./middlewares/agent/checkUser.js";
import chekToken from "./middlewares/agent/chekToken.js";

import cluster from "cluster";
import os from "os";
const cCPUs = os.cpus().length;

if (cluster.isMaster) {
  // Create a worker for each CPU
  //for (let i = 0; i < cCPUs; i++) {
  for (let i = 0; i < 2; i++) {
    cluster.fork();
  }
  cluster.on("online", function (worker) {
    console.log("Worker " + worker.process.pid + " is online.");
  });
  cluster.on("exit", function (worker) {
    console.log("worker " + worker.process.pid + " died.");
  });
} else {
  const app = express();

  connectDatabase();
  initialDatabase();

  let rootPath = path.resolve();
  rootPath = path.join(rootPath, "public");

  //ความปลอดภัยของ server
  app.use(helmet());
  app.use(express.json({ limit: "50MB" }));
  app.use(express.urlencoded({ extended: false }));
  app.use(passport.initialize());
  app.use(express.static(rootPath));
  app.set("view engine", "ejs");

  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: config.IO_CORS,
    },
  });

  app.io = io;
  io.on("connection", function (socket) {
    console.log("connection =>", socket.id);
  });

  app.get("/", (req, res) => {
    res.render("index");
  });
  app.use("/", routesRuksm);
  app.use("/agent", apiCheck, checkUser, chekToken, agentRoute);
  app.use("*", notFound);
  app.use(errorHandler);
  autoSendUssd(io);
  checkScheduleAndSetTimeOut(io);
  autoSendMessage(io);

  httpServer.listen(config.PORT, () =>
    console.log("server is listenning on port " + config.PORT)
  );
}
