import express from "express";
import passport from "passport";
import path from "path";
import helmet from "helmet";
import { Server } from "socket.io";
import { createServer } from "http";
import config from "./config/index.js";
import connectDatabase from "./database/index.js";
import errorHandler from "./middlewares/errorHandler.js";
import routes from "./routes/index.js";
import checkScheduleAndSetTimeOut from "./utilities/checkScheduleAndSetTimeOut.js";
import autoSendUssd from "./utilities/auto-send-ussd.js";
import autoSendMessage from "./utilities/autoSendMessage.js";
import initialDatabase from "./utilities/initial-database/index.js";

import cluster from "cluster";
import os from "os";
const cCPUs = os.cpus().length;

if (cluster.isMaster) {
  // Create a worker for each CPU
  for (let i = 0; i < cCPUs; i++) {
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

  app.use(routes);
  app.use(errorHandler);
  autoSendUssd(io);
  checkScheduleAndSetTimeOut(io);
  autoSendMessage(io);

  httpServer.listen(config.PORT, () =>
    console.log("server is listenning on port " + config.PORT)
  );
}
