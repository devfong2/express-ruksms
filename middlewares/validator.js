import { validationResult, body } from "express-validator";

const checkValidate = (req, res, next) => {
  try {
    const validError = validationResult(req);
    if (!validError.isEmpty()) {
      throw new Error(validError.array()[0].msg);
    }
    next();
  } catch (e) {
    next(e);
  }
};

export const signInValidation = [
  body("email").not().isEmpty().withMessage("กรุณากรอกอีเมล"),
  body("password").not().isEmpty().withMessage("กรุณากรอกหรัสผ่าน"),
];

export default checkValidate;
