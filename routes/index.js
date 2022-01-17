import express from "express";
import requiredSignIn from "../middlewares/authenticate.js";
import servicesRouter from "./services.route.js";
import ussdRouter from "./ussd.route.js";
import userRoute from "./user.route.js";
import deviceRoute from "./device.route.js";
import templateRoute from "./template.route.js";
import contactListRoute from "./contactList.route.js";
import contactRoute from "./contact.route.js";

const router = express.Router();

router.use("/", servicesRouter);
router.use("/ussd", requiredSignIn, ussdRouter);
router.use("/user", userRoute);
router.use("/device", requiredSignIn, deviceRoute);
router.use("/template", requiredSignIn, templateRoute);
router.use("/contact-list", requiredSignIn, contactListRoute);
router.use("/contact", requiredSignIn, contactRoute);

export default router;
