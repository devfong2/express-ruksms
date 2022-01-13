import TemplateModel from "../models/template.model.js";

const allTemplate = async (req, res, next) => {
  try {
    const templates = await TemplateModel.find();
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
    const templates = await TemplateModel.find();
    res.json({
      success: true,
      data: templates,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

export default { createTemplate, allTemplate, deleteTemplate };
