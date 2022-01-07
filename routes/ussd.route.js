import express from "express";
import ussdController from "../controllers/ussd.controller.js";
const ussdRouter = express.Router();

ussdRouter.post("/send-request", ussdController.sendUssdRequest);
ussdRouter.get("/", ussdController.allUssd);
ussdRouter.post("/delete", ussdController.deleteUssd);

export default ussdRouter;
