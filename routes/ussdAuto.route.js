import { Router } from "express";
import ussdAutoCon from "../controllers/ussdAuto/index.js";
const ussdAutoRoute = Router();
ussdAutoRoute.post("/", ussdAutoCon.createUssdAuto);
ussdAutoRoute.get("/", ussdAutoCon.allUssdAuto);
ussdAutoRoute.post("/delete", ussdAutoCon.deleteUssdAuto);
export default ussdAutoRoute;
