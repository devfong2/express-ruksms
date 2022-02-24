import { Router } from "express";
import offensiveWordController from "../controllers/offensiveWord.controller.js";
const offensiveWordRoute = Router();

offensiveWordRoute.get("/", offensiveWordController.allOffensiveWord);
offensiveWordRoute.post("/", offensiveWordController.createOffensiveWord);
offensiveWordRoute.put("/:id", offensiveWordController.updateOffensiveWord);
offensiveWordRoute.post("/delete", offensiveWordController.deleteOffensiveWord);
export default offensiveWordRoute;
