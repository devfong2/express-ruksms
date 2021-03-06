import express from "express";
import ussdController from "../../controllers/ussd.controller.js";
const ussdRouter = express.Router();

ussdRouter.post("/send-request", ussdController.sendUssdRequest);
ussdRouter.post("/send-many-request", ussdController.sendUssdManyRequest);
ussdRouter.get("/", ussdController.allUssd);
ussdRouter.get("/check-carrier", ussdController.ussdForCheckCarrier);
ussdRouter.get("/start-send-pending-ussd", ussdController.startSendPendingUssd);
ussdRouter.post("/delete", ussdController.deleteUssd);

export default ussdRouter;
