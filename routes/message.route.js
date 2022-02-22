import { Router } from "express";
import messageController from "../controllers/message.controller.js";
const messageRoute = Router();
messageRoute.post("/", messageController.allMessage);
messageRoute.post("/send-message", messageController.sendMessage);
messageRoute.post("/delete", messageController.deleteMessage);
messageRoute.post("/search", messageController.searchMessage);
messageRoute.post("/resend", messageController.resendMessage);
export default messageRoute;
