import { Router } from "express";
import templateController from "../controllers/template.controller.js";
const templateRoute = Router();
templateRoute.get("/", templateController.allTemplate);
templateRoute.post("/", templateController.createTemplate);
templateRoute.post("/delete", templateController.deleteTemplate);
export default templateRoute;
