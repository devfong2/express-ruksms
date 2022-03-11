import jwt from "jsonwebtoken";
import ApiKeyModel from "../../models/apiKey.model.js";
export default async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    // console.log(authorization);
    if (!authorization) {
      const err = new Error("Authorization is required");
      err.statusCode = 401;
      throw err;
    }
    if (authorization.split(" ")[0].toLowerCase() !== "bearer") {
      const err = new Error("Required authorization type Bearer token only ");
      err.statusCode = 404;
      throw err;
    }
    const agent = jwt.verify(authorization.split(" ")[1], req.user.apiKey);
    const token = await ApiKeyModel.findOne({
      token: authorization.split(" ")[1],
      user: req.user._id,
    });
    if (!token) {
      const err = new Error("Unknown token");
      err.statusCode = 404;
      throw err;
    }
    req.body = { ...agent, ...req.body };
    next();
  } catch (e) {
    next(e);
  }
};
