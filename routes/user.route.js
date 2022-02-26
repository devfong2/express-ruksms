import { Router } from "express";
import userController from "../controllers/users/index.js";
import requiredSignIn from "../middlewares/authenticate.js";
import requiredAdmin from "../middlewares/requiredAdmin.js";
import checkValidate, { signInValidation } from "../middlewares/validator.js";

const userRoute = Router();

//normal user
userRoute.post("/register", userController.register);
userRoute.post("/reset-password", userController.resetPassword);
userRoute.post("/verify-token", userController.verifyToken);
userRoute.post("/confirm-reset-password", userController.confirmResetPassword);
userRoute.post("/check-recaptcha", userController.checkRecaptcha);
userRoute.post(
  "/sign-in",
  signInValidation,
  checkValidate,
  userController.signIn
);

//member
userRoute.post("/sign-out", requiredSignIn, userController.signOut);
userRoute.get("/me", requiredSignIn, userController.me);
userRoute.get("/", requiredSignIn, userController.allUser);
userRoute.put("/:id", requiredSignIn, userController.updateUser);
userRoute.put(
  "/update-password/:id",
  requiredSignIn,
  userController.updatePassword
);

//admin
userRoute.post("/", requiredSignIn, requiredAdmin, userController.createUser);
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
userRoute.put(
  "/user-detail/:id",
  requiredSignIn,
  requiredAdmin,
  userController.updateUserDetail
);
userRoute.post(
  "/delete",
  requiredSignIn,
  requiredAdmin,
  userController.deleteUser
);
userRoute.post(
  "/disguise",
  requiredSignIn,
  requiredAdmin,
  userController.disguise
);

userRoute.post(
  "/report-user",
  requiredSignIn,
  requiredAdmin,
  userController.reportUser
);

export default userRoute;
