import express from "express";
import requiredSignIn from "../middlewares/authenticate.js";
import servicesRouter from "./services.route.js";
import ussdRouter from "./ussd.route.js";
import userRoute from "./user.route.js";
import deviceRoute from "./device.route.js";
import templateRoute from "./template.route.js";
import contactListRoute from "./contactList.route.js";
import contactRoute from "./contact.route.js";
import messageRoute from "./message.route.js";
import checkExpiry from "../middlewares/expiryDate.js";
import planRoute from "./plan.route.js";
import settingRoute from "./setting.route.js";
import subscriptionRoute from "./subscription.route.js";
import ussdAutoRoute from "./ussdAuto.route.js";
import offensiveWordRoute from "./offensiveWord.route.js";
import requiredAdmin from "../middlewares/requiredAdmin.js";

const router = express.Router();

router.use("/", servicesRouter);
router.use("/ussd", requiredSignIn, checkExpiry, ussdRouter);
router.use("/user", userRoute);
router.use("/device", requiredSignIn, checkExpiry, deviceRoute);
router.use("/template", requiredSignIn, checkExpiry, templateRoute);
router.use("/contact-list", requiredSignIn, checkExpiry, contactListRoute);
router.use("/contact", requiredSignIn, checkExpiry, contactRoute);
router.use("/message", requiredSignIn, checkExpiry, messageRoute);
router.use("/plan", planRoute);
router.use("/setting", settingRoute);
router.use("/subscription", requiredSignIn, subscriptionRoute);
router.use("/ussd-auto", requiredSignIn, ussdAutoRoute);
router.use("/offensiveword", requiredSignIn, requiredAdmin, offensiveWordRoute);

export default router;
