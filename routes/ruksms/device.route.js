import { Router } from "express";
import rateLimit from "express-rate-limit";
import deviceController from "../../controllers/device.controller.js";
const deviceRoute = Router();

const apiLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 1, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

deviceRoute.get("/", deviceController.allDevice);
deviceRoute.get("/:id", deviceController.findDeviceById);
deviceRoute.put("/:id", deviceController.updateDeviceById);
deviceRoute.post("/delete", deviceController.deleteDevice);
deviceRoute.post("/message", deviceController.countMessageByDevice);
deviceRoute.post("/motivate", apiLimiter, deviceController.motivate);
export default deviceRoute;
