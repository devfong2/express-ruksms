import { Router } from "express";
import planController from "../controllers/plan.controller.js";
const planRoute = Router();
planRoute.get("/", planController.allPlan);
planRoute.post("/", planController.createPlan);
planRoute.put("/:id", planController.updatePlan);
planRoute.delete("/:id", planController.deletePlan);
export default planRoute;
