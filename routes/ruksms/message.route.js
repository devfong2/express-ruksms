import { Router } from "express";
import messageController from "../../controllers/message/index.js";
import checkValidate, {
  sendMessageValidation,
} from "../../validation/index.js";
const messageRoute = Router();
messageRoute.post("/", messageController.allMessage);
messageRoute.post(
  "/send-message",
  [sendMessageValidation, checkValidate],
  messageController.sendMessage
);
messageRoute.post("/delete", messageController.deleteMessage);
messageRoute.post("/search", messageController.searchMessage);
messageRoute.post("/resend", messageController.resendMessage);
export default messageRoute;
