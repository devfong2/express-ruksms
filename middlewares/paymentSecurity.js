// import jwt from "jsonwebtoken";
// import config from "../config/index.js";
// export default (req, res, next) => {
//   try {
//     const { security } = req.body;
//     if (!security) {
//       const err = new Error("invalid payment security");
//       err.statusCode = 401;
//       throw err;
//     }
//     jwt.verify(security, config.JWT_SECRET);
//     next();
//   } catch (e) {
//     next(e);
//   }
// };
