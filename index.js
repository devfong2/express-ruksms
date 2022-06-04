import express from "express";
import passport from "passport";
import cors from "cors";
import path from "path";
import helmet from "helmet";
import config from "./config/index.js";
import connectDatabase from "./database/index.js";
import errorHandler from "./middlewares/errorHandler.js";
import routesRuksms from "./routes/ruksms/index.js";
import checkScheduleAndSetTimeOut from "./utilities/checkScheduleAndSetTimeOut.js";
import autoSendUssd from "./utilities/auto-send-ussd.js";
import autoSendMessage from "./utilities/autoSendMessage.js";
import notFound from "./middlewares/notFound.js";
import agentRoute from "./routes/agent/index.js";
import agentCheck from "./middlewares/agent/agentCheck.js";
import checkUser from "./middlewares/agent/checkUser.js";
import chekToken from "./middlewares/agent/chekToken.js";
import apiRoute from "./routes/api/index.js";
import apiCheck from "./middlewares/agent/apiCheck.js";

const app = express();

connectDatabase();

let rootPath = path.resolve();
rootPath = path.join(rootPath, "public");

//ความปลอดภัยของ server
app.use(helmet());
app.use(express.json({ limit: "256mb" }));
app.use(express.urlencoded({ limit: "256mb", extended: false }));
app.use(passport.initialize());
app.use(express.static(rootPath));
app.set("views", "./views");
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index");
});

app.use("/", routesRuksms);
app.use("/agent", agentCheck, checkUser, chekToken, agentRoute);
app.use("/v1", cors(), apiCheck, apiRoute);
app.use("*", notFound);
app.use(errorHandler);

app.listen(config.PORT, () => {
  autoSendUssd();
  checkScheduleAndSetTimeOut();
  autoSendMessage();
  console.log("server is listenning on port " + config.PORT);
});
