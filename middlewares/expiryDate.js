export default (req, res, next) => {
  try {
    const { user } = req;
    // เช็ควันหมดอายุและเครดิต
    const present = new Date();
    const expiryDate = new Date(user.expiryDate);
    if (user.expiryDate !== null && present > expiryDate) {
      const err = new Error(
        "Your account is expired.Please subscribed my plan"
      );
      err.statusCode = 402;
      throw err;
    }
    next();
  } catch (e) {
    next(e);
  }
};
