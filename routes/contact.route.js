import { Router } from "express";
import contactController from "../controllers/contact.controller.js";
const contactRoute = Router();
contactRoute.get("/", contactController.allContact);
contactRoute.post("/", contactController.createContact);
contactRoute.post("/delete", contactController.deleteContact);
contactRoute.put("/", contactController.updateContact);
export default contactRoute;
