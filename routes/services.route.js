import express from "express";
import servicesController from "../controllers/services/index.js";
const servicesRouter = express.Router();

servicesRouter.post("/register-device.php", servicesController.registerDevice);
servicesRouter.post("/update-token.php", servicesController.updateToken);
servicesRouter.post("/sign-in.php", servicesController.signIn);
servicesRouter.post("/sign-out.php", servicesController.signOut);
servicesRouter.post("/ussd-response.php", servicesController.ussdResponse);
servicesRouter.post("/get-messages.php", servicesController.getMessages);
servicesRouter.post("/report-status.php", servicesController.reportStatus);
servicesRouter.post("/receive-message.php", servicesController.receiveMessage);
servicesRouter.get("/update.php", (req, res) =>
  res.json({
    versionCode: 30,
    url: "https://ruksms.com",
  })
);

export default servicesRouter;
