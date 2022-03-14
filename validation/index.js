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

export const sendMessageValidation = [
  body("messages").not().isEmpty().withMessage("messages is required"),
  body("messages")
    .custom((val) => {
      return Array.isArray(val);
    })
    .withMessage("messages must be array"),
  body("prioritize")
    .not()
    .isEmpty()
    .isInt()
    .withMessage("prioritize is required and integer ony"),
  body("senders").not().isEmpty().withMessage("senders is required"),
  body("senders")
    .custom((val) => {
      return Array.isArray(val);
    })
    .withMessage("messages must be array"),
  body("perMessage")
    .not()
    .isEmpty()
    .isInt()
    .withMessage("perMessage is required and integer ony"),
];

export default checkValidate;
