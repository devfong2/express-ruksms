import PlanModel from "../models/plan.model.js";
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
    await PlanModel.findByIdAndDelete(req.params.id);
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
