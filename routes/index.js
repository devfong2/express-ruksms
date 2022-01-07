import express from "express";
import servicesRouter from "./services.route.js";
import ussdRouter from "./ussd.route.js";
import userRoute from "./user.route.js";
import deviceRoute from "./device.route.js";

const router = express.Router();

router.use("/", servicesRouter);
router.use("/ussd", ussdRouter);
router.use("/user", userRoute);
router.use("/device", deviceRoute);

export default router;
