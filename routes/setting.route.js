import { Router } from "express";
import settingController from "../controllers/setting.controller.js";
import requiredSignIn from "../middlewares/authenticate.js";
import requiredAdmin from "../middlewares/requiredAdmin.js";
const settingRoute = Router();
settingRoute.get("/", requiredSignIn, settingController.allSetting);
settingRoute.get("/website", settingController.websiteData);
settingRoute.get(
  "/dashboard-data",
  requiredSignIn,
  settingController.dashBoardData
);
settingRoute.put(
  "/",
  requiredSignIn,
  requiredAdmin,
  settingController.updateSetting
);
settingRoute.put(
  "/website",
  requiredSignIn,
  requiredAdmin,
  settingController.updateSettingWebSite
);
export default settingRoute;
