import { Router } from "express";
import payment from "../../controllers/payment/index.js";
// import requiredSignIn from "../../middlewares/authenticate.js";
// import signature from "../../middlewares/signature.js";

const paymentRoute = Router();

paymentRoute.post("/success", payment.success);
paymentRoute.get(
  "/generate-reference",
  //   signature,
  //   requiredSignIn,
  payment.generateReference
);

export default paymentRoute;
