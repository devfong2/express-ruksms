import UssdModel from "../../models/ussd.model.js";
import updateDashboard from "../../utilities/update-dashboard.js";

export default async (req, res, next) => {
  try {
    // console.table(req.body);
    const { androidId, userId, ussdId, response } = req.body;
    if (!androidId && !userId && !ussdId && !response) {
      const err = new Error(`Invalid data`);
      err.statusCode = 200;
      throw err;
    }
    const ussd = await UssdModel.findOneAndUpdate(
      { ID: req.body.ussdId },
      {
        response: req.body.response,
        responseDate: new Date().toISOString(),
      },
      { new: true }
    );
    req.app.io.emit("updateUssd", ussd);
    req.user = { _id: ussd.userID };
    await updateDashboard(req);

    res.json({
      success: true,
      data: null,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};
