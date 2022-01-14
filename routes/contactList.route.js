import { Router } from "express";
import contactListController from "../controllers/contactList.controller.js";
const contactListRoute = Router();

contactListRoute.get("/", contactListController.allContactList);
contactListRoute.post("/", contactListController.createContactList);
contactListRoute.put("/:id", contactListController.updateContactList);
contactListRoute.delete("/:id", contactListController.deleteContactList);

export default contactListRoute;
