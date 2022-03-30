import { Router } from "express";
import apiCon from "../../controllers/api/index.js";
import checkValidate from "../../validation/index.js";
import {
  checkQueryGetMessage,
  checkStatusMessage,
} from "../../validation/api.js";

const apiRoute = Router();

apiRoute.get(
  "/message",
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

export default apiRoute;
