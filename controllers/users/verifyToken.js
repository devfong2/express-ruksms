import Jwt from "jsonwebtoken";
import config from "../../config/index.js";
export default async (req, res, next) => {
  try {
    const { token } = req.body;
    const result = Jwt.verify(token, config.JWT_SECRET);
    const expireDate = new Date(0);
    expireDate.setUTCSeconds(result.exp);
    if (expireDate < new Date()) {
      throw new Error("Link reset password is expired");
    }
    // console.log(result);
    res.json({
      success: true,
      data: null,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};
