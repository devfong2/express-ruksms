import TemplateModel from "../models/template.model.js";
import activity from "../utilities/activity.js";
const allTemplate = async (req, res, next) => {
  try {
    const templates = await TemplateModel.find({ userID: req.user._id });
    res.json({
      success: true,
      data: templates,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

const createTemplate = async (req, res, next) => {
  try {
    const template = await TemplateModel.create(req.body);
    await activity(req, "สร้างแม่แบบการส่งข้อความ " + template.name);
    res.json({
      success: true,
      data: template,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

const deleteTemplate = async (req, res, next) => {
  try {
    await TemplateModel.deleteMany({
      _id: { $in: req.body.selectedID },
    });
    const templates = await TemplateModel.find({ userID: req.user._id });
    await activity(req, "ลบแม่แบบการส่งข้อความ");
    res.json({
      success: true,
      data: templates,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

const updateTemplate = async (req, res, next) => {
  try {
    const { name, message } = req.body;
    const template = await TemplateModel.findByIdAndUpdate(
      req.params.id,
      { name, message },
      { new: true }
    );
    await activity(req, "แก้ไขแม่แบบการส่งข้อความ " + template.name);
    res.json({
      success: true,
      data: template,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

export default { createTemplate, allTemplate, deleteTemplate, updateTemplate };
