import express from "express";
import servicesController from "../controllers/services/index.js";
import signature from "../middlewares/signature.js";
const servicesRouter = express.Router();

servicesRouter.post(
  "/register-device.php",
  signature,
  servicesController.registerDevice
);
servicesRouter.post(
  "/update-token.php",
  signature,
  servicesController.updateToken
);
servicesRouter.post("/sign-in.php", signature, servicesController.signIn);
servicesRouter.post("/sign-out.php", signature, servicesController.signOut);
servicesRouter.post(
  "/ussd-response.php",
  signature,
  servicesController.ussdResponse
);
servicesRouter.post(
  "/get-messages.php",
  signature,
  servicesController.getMessages
);
servicesRouter.post(
  "/report-status.php",
  signature,
  servicesController.reportStatus
);
servicesRouter.post(
  "/receive-message.php",
  signature,
  servicesController.receiveMessage
);
// servicesRouter.get("/update.php", (req, res) =>
//   res.json({
//     versionCode: 30,
//     url: "https://ruksms.com",
//   })
// );

export default servicesRouter;
