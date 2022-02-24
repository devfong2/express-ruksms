import OffensiveWordModel from "../models/offensiveWord.model.js";
import activity from "../utilities/activity.js";
const createOffensiveWord = async (req, res, next) => {
  try {
    const { word, reason } = req.body;
    const result = await OffensiveWordModel.create({ word, reason });
    await activity(req, `เพิ่มคำต้องห้าม ${word} = ${reason}`);
    res.json({
      success: true,
      data: result,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

const updateOffensiveWord = async (req, res, next) => {
  try {
    const { word, reason } = req.body;
    const result = await OffensiveWordModel.findByIdAndUpdate(
      req.params.id,
      { word, reason },
      { new: true }
    );
    await activity(req, `แก้ไขคำต้องห้าม ${word} = ${reason}`);
    res.json({
      success: true,
      data: result,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

const deleteOffensiveWord = async (req, res, next) => {
  try {
    const { selectedID } = req.body;
    await OffensiveWordModel.deleteMany({ _id: { $in: selectedID } });
    const result = await OffensiveWordModel.find();
    await activity(req, `ลบคำต้องห้าม`);
    res.json({
      success: true,
      data: result,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

const allOffensiveWord = async (req, res, next) => {
  try {
    const result = await OffensiveWordModel.find();
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
  createOffensiveWord,
  updateOffensiveWord,
  deleteOffensiveWord,
  allOffensiveWord,
};
