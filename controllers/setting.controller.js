import SettingModel from "../models/setting.model.js";

const allSetting = async (req, res, next) => {
  try {
    const settings = await SettingModel.find();
    res.json({
      success: true,
      data: settings,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

const updateSetting = async (req, res, next) => {
  try {
    const { name, value } = req.body;
    const setting = await SettingModel.findOneAndUpdate(
      { name },
      { value },
      { new: true }
    );
    res.json({
      success: true,
      data: setting,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

export default { allSetting, updateSetting };
