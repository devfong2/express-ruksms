export default async (req, res, next) => {
  try {
    const { user } = req;
    // เช็คระบบ agent
    if (!user.subscription) {
      const err = new Error("You should buy an agent package from us");
      err.statusCode = 402;
      throw err;
    }
    // console.log(user);
    if (!user.subscription.planID.agent) {
      const err = new Error(
        "Your account is not authorized to use agent system"
      );
      err.statusCode = 402;
      throw err;
    }

    // เช็คระงับการใช้งาน
    if (user.userDetail[0].suspend === 0) {
      const err = new Error("Your account is suspend");
      err.statusCode = 405;
      throw err;
    }

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
