import config from "../config/index.js";
export default (req, res, next) => {
  try {
    const err = new Error(
      `${req.method} => ${config.SERVER_URL}${req.originalUrl} not found`
    );
    err.statusCode = 404;
    throw err;
  } catch (e) {
    next(e);
  }
};
