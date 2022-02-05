import express from "express";
import ussdController from "../controllers/ussd.controller.js";
const ussdRouter = express.Router();

ussdRouter.post("/send-request", ussdController.sendUssdRequest);
ussdRouter.post("/send-many-request", ussdController.sendUssdManyRequest);
ussdRouter.get("/user/:id", ussdController.allUssd);
ussdRouter.get("/check-carrier", ussdController.ussdForCheckCarrier);
ussdRouter.get("/pending-ussd", ussdController.getPendingUssd);
ussdRouter.post("/delete", ussdController.deleteUssd);

export default ussdRouter;
