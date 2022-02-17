import PlanModel from "../models/plan.model.js";
import activity from "../utilities/activity.js";
const allPlan = async (req, res, next) => {
  try {
    const result = await PlanModel.find();
    res.json({
      success: true,
      data: result,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

const createPlan = async (req, res, next) => {
  try {
    const result = await PlanModel.create(req.body);
    await activity(req.user._id, `สร้างแพ็กเกจ ${result.name}`);
    res.json({
      success: true,
      data: result,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

const updatePlan = async (req, res, next) => {
  try {
    const result = await PlanModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    await activity(req.user._id, `แก้ไขแพ็กเกจ ${result.name}`);
    res.json({
      success: true,
      data: result,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

const deletePlan = async (req, res, next) => {
  try {
    const result = await PlanModel.findByIdAndDelete(req.params.id);
    await activity(req.user._id, `ลบแพ็กเกจ ${result.name}`);
    res.json({
      success: true,
      data: null,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

export default { allPlan, createPlan, updatePlan, deletePlan };
