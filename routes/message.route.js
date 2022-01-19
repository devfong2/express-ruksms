import { Router } from "express";
import messageController from "../controllers/message.controller.js";
const messageRoute = Router();
messageRoute.post("/send-message", messageController.sendMessage);
export default messageRoute;
