import { query } from "express-validator";
export const checkQueryGetMessage = [
  query("page").not().isEmpty().withMessage("page is required"),
  query("page").isInt().withMessage("page must be integer"),
  query("page").isFloat({ min: 1 }).withMessage("page must be >= 1"),
  query("limit").not().isEmpty().withMessage("limit is required"),
  query("limit").isInt().withMessage("limit must be integer"),
  query("limit")
    .isFloat({ min: 25, max: 200 })
    .withMessage("limit must be between 25 to 200"),
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
