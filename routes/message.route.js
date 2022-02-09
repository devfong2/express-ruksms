import { Router } from "express";
import messageController from "../controllers/message.controller.js";
const messageRoute = Router();
messageRoute.get("/", messageController.allMessage);
messageRoute.post("/send-message", messageController.sendMessage);
messageRoute.post("/delete", messageController.deleteMessage);
messageRoute.post("/search", messageController.searchMessage);
export default messageRoute;
