import { Router } from "express";
import deviceController from "../controllers/device.controller.js";
const deviceRoute = Router();
deviceRoute.get("/", deviceController.allDevice);
deviceRoute.get("/:id", deviceController.findDeviceById);
deviceRoute.put("/:id", deviceController.updateDeviceById);
deviceRoute.post("/delete", deviceController.deleteDevice);
deviceRoute.post("/message", deviceController.countMessageByDevice);
export default deviceRoute;
