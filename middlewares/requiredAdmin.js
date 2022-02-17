export default (req, res, next) => {
  try {
    if (req.user.isAdmin !== 1) {
      const err = new Error("You are not admin");
      err.statusCode = 401;
      throw err;
    }
    next();
  } catch (e) {
    next(e);
  }
};
