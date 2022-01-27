import { Router } from "express";
import settingController from "../controllers/setting.controller.js";
const settingRoute = Router();
settingRoute.get("/", settingController.allSetting);
settingRoute.put("/", settingController.updateSetting);
export default settingRoute;
