import { Router } from "express";
import planController from "../../controllers/plan.controller.js";
import requiredSignIn from "../../middlewares/authenticate.js";
import requiredAdmin from "../../middlewares/requiredAdmin.js";
const planRoute = Router();
planRoute.get("/", planController.allPlan);
planRoute.post("/", requiredSignIn, requiredAdmin, planController.createPlan);
planRoute.put("/:id", requiredSignIn, requiredAdmin, planController.updatePlan);
planRoute.delete(
  "/:id",
  requiredSignIn,
  requiredAdmin,
  planController.deletePlan
);
export default planRoute;
