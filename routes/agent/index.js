import { Router } from "express";
import messageController from "../../controllers/message/index.js";
import checkValidate, {
  checkFetchMessage,
  checkTypeInParam,
  sendMessageValidation,
} from "../../validation/index.js";
import resendMessage from "./resend-message.js";
import sendMessage from "./send-message.js";

const agentRoute = Router();
agentRoute.get("/", (req, res) => {
  res.json({
    success: true,
    data: req.user,
    error: null,
  });
});

agentRoute.post(
  "/send-message",
  [sendMessageValidation, checkValidate],
  sendMessage
);
agentRoute.post("/resend-message", resendMessage);
agentRoute.post(
  "/fetch-message",
  [checkFetchMessage, checkValidate],
  messageController.fetchMessageForAgent
);

agentRoute.put(
  "/:type",
  [checkTypeInParam(["start", "stop"]), checkValidate],
  messageController.startStopMessage
);
agentRoute.post("/delete-message", messageController.deleteMessage);
// agentRoute.post("/delete", messageController.deleteMessage);
// agentRoute.post("/search", messageController.searchMessage);
// agentRoute.post("/resend", messageController.resendMessage);
export default agentRoute;
