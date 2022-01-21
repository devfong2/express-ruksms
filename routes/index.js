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

const router = express.Router();

router.use("/", servicesRouter);
router.use("/ussd", requiredSignIn, checkExpiry, ussdRouter);
router.use("/user", userRoute);
router.use("/device", requiredSignIn, checkExpiry, deviceRoute);
router.use("/template", requiredSignIn, checkExpiry, templateRoute);
router.use("/contact-list", requiredSignIn, checkExpiry, contactListRoute);
router.use("/contact", requiredSignIn, checkExpiry, contactRoute);
router.use("/message", requiredSignIn, checkExpiry, messageRoute);
router.use("/plan", requiredSignIn, planRoute);

export default router;
