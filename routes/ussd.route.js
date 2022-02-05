import express from "express";
import ussdController from "../controllers/ussd.controller.js";
const ussdRouter = express.Router();

ussdRouter.post("/send-request", ussdController.sendUssdRequest);
ussdRouter.post("/send-many-request", ussdController.sendUssdManyRequest);
ussdRouter.post(
  "/start-send-many-request",
  ussdController.startSendUssdManyRequest
);
ussdRouter.get("/", ussdController.allUssd);
ussdRouter.get("/check-carrier", ussdController.ussdForCheckCarrier);
ussdRouter.post("/delete", ussdController.deleteUssd);

export default ussdRouter;
