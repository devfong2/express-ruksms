import { Router } from "express";
import subscriptionController from "../controllers/subscription.controller.js";
import requiredAdmin from "../middlewares/requiredAdmin.js";
const subscriptionRoute = Router();
subscriptionRoute.post(
  "/",
  requiredAdmin,
  subscriptionController.createSubscription
);
subscriptionRoute.get("/", subscriptionController.allSubscriptions);
export default subscriptionRoute;
