import { Router } from "express";
import deviceController from "../controllers/device.controller.js";
const deviceRoute = Router();
deviceRoute.get("/", deviceController.allDevice);
export default deviceRoute;
