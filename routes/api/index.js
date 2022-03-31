import { Router } from "express";
import cors from "cors";
import apiCon from "../../controllers/api/index.js";
import checkValidate from "../../validation/index.js";
import {
  checkQueryGetMessage,
  checkSendMessage,
  checkStatusMessage,
} from "../../validation/api.js";
import allowCors from "../../middlewares/agent/allowCors.js";

const apiRoute = Router();

apiRoute.get(
  "/message",
  cors(allowCors),
  [
    checkQueryGetMessage,
    checkStatusMessage([
      "pending",
      "queued",
      "scheduled",
      "sent",
      "failed",
      "received",
      "all",
    ]),
    checkValidate,
  ],
  apiCon.getMessage
);

apiRoute.post(
  "/message",
  cors(allowCors),
  [checkSendMessage, checkValidate],
  apiCon.sendMessage
);

export default apiRoute;
