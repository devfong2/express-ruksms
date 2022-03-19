import { validationResult, body, param } from "express-validator";
import mongoose from "mongoose";

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
  body("perMessage").not().isEmpty().withMessage("perMessage is required"),
  body("perMessage").isInt().withMessage("perMessage must be integer only"),
];

export const checkFetchMessage = [
  body("ids").not().isEmpty().withMessage("ids is required"),
  body("ids")
    .custom((val) => Array.isArray(val))
    .withMessage("ids must be array"),
  body("ids").custom((val) =>
    val.every((item) => mongoose.Types.ObjectId.isValid(item))
  ),
  body("select").not().isEmpty().withMessage("select is required"),
];

export const checkTypeInParam = (arrType) => {
  return [
    param("type").not().isEmpty().withMessage("type is required"),
    param("type")
      .custom((val) => {
        return arrType.includes(val);
      })
      .withMessage("Invalid type. Must be in " + arrType),
  ];
};

export default checkValidate;
