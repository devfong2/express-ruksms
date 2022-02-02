import express from "express";
import passport from "passport";
import path from "path";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { Server } from "socket.io";
import { createServer } from "http";
import config from "./config/index.js";
import connectDatabase from "./database/index.js";
import errorHandler from "./middlewares/errorHandler.js";
import routes from "./routes/index.js";

const app = express();

connectDatabase();

let rootPath = path.resolve();
rootPath = path.join(rootPath, "public");

// app.use(cors());
// app.set("trust proxy", 1);

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

//  apply to all requests
app.use(limiter);

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
    // methods: ["GET", "POST"]
  },
});

// eslint-disable-next-line no-undef
// console.log(process.env.NODE_ENV);

app.io = io;
io.on("connection", function (socket) {
  console.log("connection =>", socket.id);
});

app.use(routes);
app.use(errorHandler);

httpServer.listen(config.PORT, () =>
  console.log("server is listenning on port " + config.PORT)
);
