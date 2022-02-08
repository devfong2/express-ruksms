import { Router } from "express";
import subscriptionController from "../controllers/subscription.controller.js";
const subscriptionRoute = Router();
subscriptionRoute.post("/", subscriptionController.createSubscription);
subscriptionRoute.get("/", subscriptionController.allSubscriptions);
export default subscriptionRoute;
