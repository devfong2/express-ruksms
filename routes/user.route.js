import { Router } from "express";
import userController from "../controllers/user.controller.js";
import requiredSignIn from "../middlewares/authenticate.js";
import checkValidate, { signInValidation } from "../middlewares/validator.js";

const userRoute = Router();

userRoute.post("/", userController.createUser);
userRoute.get("/", userController.allUser);
userRoute.get("/me", requiredSignIn, userController.me);
userRoute.post(
  "/sign-in",
  signInValidation,
  checkValidate,
  userController.signIn
);
userRoute.put("/:id", userController.updateUser);
userRoute.put("/update-password/:id", userController.updatePassword);

export default userRoute;
