import { Router } from "express";
import messageController from "../../controllers/message/index.js";
import checkValidate, {
  sendMessageValidation,
} from "../../validation/index.js";

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
  messageController.sendMessage
);
agentRoute.post("/", messageController.allMessage);
// agentRoute.post("/delete", messageController.deleteMessage);
// agentRoute.post("/search", messageController.searchMessage);
// agentRoute.post("/resend", messageController.resendMessage);
export default agentRoute;
