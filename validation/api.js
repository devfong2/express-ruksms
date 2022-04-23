import { body, query } from "express-validator";
export const checkQueryGetMessage = [
  query("page").not().isEmpty().withMessage("page is required"),
  query("page").isInt().withMessage("page must be integer"),
  query("page").isFloat({ min: 1 }).withMessage("page must be >= 1"),
  query("limit").not().isEmpty().withMessage("limit is required"),
  query("limit").isInt().withMessage("limit must be integer"),
  query("limit")
    .isFloat({ min: 25, max: 200 })
    .withMessage("limit must be between 25 to 200"),
  query("sort").not().isEmpty().withMessage("sort is required"),
  query("sort").isIn(["asc", "desc"]).withMessage("sort must be asc or desc"),
];

export const checkStatusMessage = (arrStatus) => {
  return [
    query("status").not().isEmpty().withMessage("status is required"),
    query("status")
      .custom((val) => {
        return arrStatus.includes(val);
      })
      .withMessage("Invalid status. Must be in " + arrStatus),
  ];
};

export const checkSendMessage = [
  body("message").not().isEmpty().withMessage("message is required"),
  body("message").isString().withMessage("message must be string"),
  body("numbers").not().isEmpty().withMessage("numbers is required"),
  body("numbers").isArray().withMessage("numbers must be array"),
  body("numbers")
    .custom((val) => {
      const checkType = (item) => {
        // console.log(item);
        return typeof item === "string";
      };
      return val.every(checkType);
    })
    .withMessage("numbers must be array of string "),
  body("numbers")
    .custom((val) => {
      const reg = new RegExp("^[+0-9]+$");
      const checkNum = (item) => reg.test(item);
      return val.every(checkNum);
    })
    .withMessage("numbers must be phone number"),
  body("numbers")
    .custom((val) => {
      const checkLength = (item) => {
        return item.length >= 10;
      };
      return val.every(checkLength);
    })
    .withMessage("phone number at least 10 characters in length"),
  body("devices").not().isEmpty().withMessage("devices is required"),
  body("devices").isArray().withMessage("devices must be array"),
  body("devices")
    .custom((val) => {
      const checkType = (item) => {
        return typeof item === "object";
      };
      return val.every(checkType);
    })
    .withMessage("devices must be array of object"),
  body("devices")
    .custom((val) => {
      const checkKey = (item) => {
        return "device" in item && "simSlot" in item;
      };
      return val.every(checkKey);
    })
    .withMessage(
      "devices must be array of object with key device and key simSlot"
    ),

  body("devices")
    .custom((val) => {
      const reg = new RegExp("^[0-9]+$");
      const checkKey = (item) => {
        return reg.test(item.device) && reg.test(item.simSlot);
      };
      return val.every(checkKey);
    })
    .withMessage("key device and key simSlot must be number"),
];
