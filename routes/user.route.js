import { Router } from "express";
import userController from "../controllers/user.controller.js";
import requiredSignIn from "../middlewares/authenticate.js";
import checkValidate, { signInValidation } from "../middlewares/validator.js";

const userRoute = Router();

userRoute.post("/", requiredSignIn, userController.createUser);
userRoute.get("/", requiredSignIn, userController.allUser);
userRoute.get("/me", requiredSignIn, userController.me);
userRoute.post(
  "/sign-in",
  signInValidation,
  checkValidate,
  userController.signIn
);
userRoute.put("/:id", requiredSignIn, userController.updateUser);
userRoute.put(
  "/update-password/:id",
  requiredSignIn,
  userController.updatePassword
);

export default userRoute;
