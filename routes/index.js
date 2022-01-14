import express from "express";
import servicesRouter from "./services.route.js";
import ussdRouter from "./ussd.route.js";
import userRoute from "./user.route.js";
import deviceRoute from "./device.route.js";
import templateRoute from "./template.route.js";
import contactListRoute from "./contactList.route.js";

const router = express.Router();

router.use("/", servicesRouter);
router.use("/ussd", ussdRouter);
router.use("/user", userRoute);
router.use("/device", deviceRoute);
router.use("/template", templateRoute);
router.use("/contact-list", contactListRoute);

export default router;
