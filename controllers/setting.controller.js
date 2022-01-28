import SettingModel from "../models/setting.model.js";
import uploadImage, { checkBase64Format } from "../utilities/upload-image.js";

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

const updateSettingWebSite = async (req, res, next) => {
  try {
    const website = await SettingModel.findOne({ name: "website" });
    const checkLogo = await checkBase64Format(req.body.logo);
    const checkFavicon = await checkBase64Format(req.body.favicon);
    if (checkLogo) {
      req.body.logo = await uploadImage(
        req.body.logo,
        "website",
        website.value.logo
      );
    }

    if (checkFavicon) {
      req.body.favicon = await uploadImage(
        req.body.favicon,
        "website",
        website.value.favicon
      );
    }
    const newWebsite = await SettingModel.findByIdAndUpdate(
      website._id,
      {
        value: req.body,
      },
      { new: true }
    );

    res.json({
      success: true,
      data: newWebsite,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

const websiteData = async (req, res, next) => {
  try {
    const settings = await SettingModel.findOne({ name: "website" });
    res.json({
      success: true,
      data: settings.value,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

export default { allSetting, updateSetting, updateSettingWebSite, websiteData };
