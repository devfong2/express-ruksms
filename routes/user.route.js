import { Router } from "express";
import userController from "../controllers/users/index.js";
import requiredSignIn from "../middlewares/authenticate.js";
import requiredAdmin from "../middlewares/requiredAdmin.js";
import checkValidate, { signInValidation } from "../middlewares/validator.js";

const userRoute = Router();

userRoute.post("/", requiredSignIn, requiredAdmin, userController.createUser);
userRoute.get("/", requiredSignIn, userController.allUser);
userRoute.get("/me", requiredSignIn, userController.me);
userRoute.get(
  "/detail",
  requiredSignIn,
  requiredAdmin,
  userController.getUserDetailByUserId
);
userRoute.post(
  "/reset",
  requiredSignIn,
  requiredAdmin,
  userController.resetUserData
);
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
userRoute.post(
  "/delete",
  requiredSignIn,
  requiredAdmin,
  userController.deleteUser
);
userRoute.post("/register", userController.register);
userRoute.post("/reset-password", userController.resetPassword);
userRoute.post("/verify-token", userController.verifyToken);
userRoute.post("/confirm-reset-password", userController.confirmResetPassword);

export default userRoute;
