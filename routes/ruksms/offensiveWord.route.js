import { Router } from "express";
import offensiveWordController from "../../controllers/offensiveWord.controller.js";
import requiredAdmin from "../../middlewares/requiredAdmin.js";
const offensiveWordRoute = Router();

offensiveWordRoute.get("/", offensiveWordController.allOffensiveWord);
offensiveWordRoute.post(
  "/",
  requiredAdmin,
  offensiveWordController.createOffensiveWord
);
offensiveWordRoute.put(
  "/:id",
  requiredAdmin,
  offensiveWordController.updateOffensiveWord
);
offensiveWordRoute.post(
  "/delete",
  requiredAdmin,
  offensiveWordController.deleteOffensiveWord
);
export default offensiveWordRoute;
