import express from "express";
import requiredSignIn from "../../middlewares/authenticate.js";
import servicesRouter from "./services.route.js";
import ussdRouter from "./ussd.route.js";
import userRoute from "./user.route.js";
import deviceRoute from "./device.route.js";
import templateRoute from "./template.route.js";
import contactListRoute from "./contactList.route.js";
import contactRoute from "./contact.route.js";
import messageRoute from "./message.route.js";
import checkExpiry from "../../middlewares/expiryDate.js";
import planRoute from "./plan.route.js";
import settingRoute from "./setting.route.js";
import subscriptionRoute from "./subscription.route.js";
import ussdAutoRoute from "./ussdAuto.route.js";
import offensiveWordRoute from "./offensiveWord.route.js";
import signature from "../../middlewares/signature.js";
import paymentRoute from "./payment.route.js";
import apiKeyRoute from "./apikey.route.js";
import apiDomainRoute from "./apiDomain.route.js";

const router = express.Router();

router.use("/", servicesRouter);
router.use("/ussd", signature, requiredSignIn, checkExpiry, ussdRouter);
router.use("/user", signature, userRoute);
router.use("/device", signature, requiredSignIn, checkExpiry, deviceRoute);
router.use("/template", signature, requiredSignIn, checkExpiry, templateRoute);
router.use(
  "/contact-list",
  signature,
  requiredSignIn,
  checkExpiry,
  contactListRoute
);
router.use("/contact", signature, requiredSignIn, checkExpiry, contactRoute);
router.use("/message", signature, requiredSignIn, checkExpiry, messageRoute);
router.use("/plan", signature, planRoute);
router.use("/setting", signature, settingRoute);
router.use("/subscription", signature, requiredSignIn, subscriptionRoute);
router.use("/ussd-auto", signature, requiredSignIn, ussdAutoRoute);
router.use("/offensiveword", signature, requiredSignIn, offensiveWordRoute);
router.use("/payment", paymentRoute);
router.use("/api-key", signature, requiredSignIn, apiKeyRoute);
router.use("/api-domain", signature, requiredSignIn, apiDomainRoute);

export default router;
