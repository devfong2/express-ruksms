import { Router } from "express";
import apiKeyController from "../../controllers/apiKey.controller.js";

const apiKeyRoute = Router();

apiKeyRoute.get("/", apiKeyController.allApiKey);
apiKeyRoute.post("/", apiKeyController.generateToken);
apiKeyRoute.delete("/", apiKeyController.deleteApiKey);
export default apiKeyRoute;
