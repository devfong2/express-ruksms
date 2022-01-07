import express from "express";
import servicesController from "../controllers/services.controller.js";
const servicesRouter = express.Router();

servicesRouter.post("/register-device.php", servicesController.registerDevice);
servicesRouter.post("/update-token.php", servicesController.updateToken);
servicesRouter.post("/sign-in.php", servicesController.signIn);
servicesRouter.post("/sign-out.php", servicesController.signOut);
servicesRouter.post("/ussd-response.php", servicesController.ussdResponse);
servicesRouter.get("/update.php", (req, res) =>
  res.json({
    versionCode: 30,
    url: "https://rbsoft.org/downloads/sms-gateway/sms-gateway.apk",
  })
);

export default servicesRouter;
