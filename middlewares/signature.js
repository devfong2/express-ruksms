import jwt from "jsonwebtoken";
import config from "../config/index.js";
export default (req, res, next) => {
  try {
    const { signature } = req.headers;
    if (!signature) {
      const err = new Error("signature is required");
      err.statusCode = 401;
      throw err;
    }
    jwt.verify(signature, config.JWT_SECRET);
    next();
  } catch (e) {
    next(e);
  }
};
