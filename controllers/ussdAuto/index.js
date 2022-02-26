import createUssdAuto, {
  sendManyTimes,
  waitTimeForSend,
} from "./createUssdAuto.js";
import allUssdAuto from "./allUssdAuto.js";
import deleteUssdAuto from "./deleteUssdAuto.js";
import UssdAutoModel from "../../models/ussdAuto.model.js";
import moment from "moment";

const startStopUssdAuto = async (req, res, next) => {
  try {
    const result = await UssdAutoModel.findByIdAndUpdate(
      req.body.id,
      {
        status: req.body.status,
      },
      { new: true }
    );
    if (result.schedule) {
      const present = moment();
      const timeForSend = moment(result.schedule);
      if (timeForSend < present) {
        sendManyTimes(result, req, next);
      } else {
        const minute = timeForSend.diff(present, "minutes");
        const secondForSchedule = minute * 60 * 1000;
        waitTimeForSend(result, secondForSchedule, req, next);
      }
    } else {
      sendManyTimes(result, req, next);
    }
    res.json({
      success: true,
      data: result,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

export default {
  createUssdAuto,
  allUssdAuto,
  deleteUssdAuto,
  startStopUssdAuto,
};
