import { Router } from "express";
import settingController from "../../controllers/setting.controller.js";
import requiredSignIn from "../../middlewares/authenticate.js";
import requiredAdmin from "../../middlewares/requiredAdmin.js";
import checkValidate, { checkGetActivity } from "../../validation/index.js";
const settingRoute = Router();
settingRoute.get(
  "/",
  requiredSignIn,
  requiredAdmin,
  settingController.allSetting
);
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
settingRoute.get(
  "/activity",
  [requiredSignIn, requiredAdmin, checkGetActivity, checkValidate],
  settingController.allActivity
);

settingRoute.delete(
  "/activity",
  requiredSignIn,
  requiredAdmin,
  settingController.deleteActivity
);
export default settingRoute;
