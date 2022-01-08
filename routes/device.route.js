import { Router } from "express";
import deviceController from "../controllers/device.controller.js";
const deviceRoute = Router();
deviceRoute.get("/", deviceController.allDevice);
deviceRoute.put("/delete", deviceController.deleteDevice);
export default deviceRoute;
