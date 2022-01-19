import UssdModel from "../../models/ussd.model.js";
export default async (req, res, next) => {
  try {
    console.table(req.body);
    const ussd = await UssdModel.findOneAndUpdate(
      { ID: req.body.ussdId },
      {
        response: req.body.response,
        responseDate: new Date().toISOString(),
      },
      { new: true }
    );
    req.app.io.emit("updateUssd", ussd);
    res.json({
      success: true,
      data: null,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};
