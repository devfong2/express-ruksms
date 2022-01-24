import express from "express";
import passport from "passport";
import { Server } from "socket.io";
import { createServer } from "http";
// import cors from "cors";
import config from "./config/index.js";
import connectDatabase from "./database/index.js";
import errorHandler from "./middlewares/errorHandler.js";
import routes from "./routes/index.js";

const app = express();

connectDatabase();

// app.use(cors());
app.use(express.json({ limit: "50MB" }));
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: config.IO_CORS,
    // methods: ["GET", "POST"]
  },
});

// eslint-disable-next-line no-undef
console.log(process.env.NODE_ENV);

app.io = io;
io.on("connection", function (socket) {
  console.log("connection =>", socket.id);
});

app.use(routes);
app.use(errorHandler);

httpServer.listen(config.PORT, () =>
  console.log("server is listenning on port " + config.PORT)
);
