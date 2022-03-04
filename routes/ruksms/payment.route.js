import { Router } from "express";
import payment from "../../controllers/payment/index.js";

const paymentRoute = Router();

paymentRoute.post("/qr-code", payment.qrCode);

export default paymentRoute;
