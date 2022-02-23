import SettingModel from "../models/setting.model.js";
import ActivityModel from "../models/activity.model.js";
import config from "../config/index.js";
import uploadImage, { checkBase64Format } from "../utilities/upload-image.js";
import updateDashboard from "../utilities/update-dashboard.js";
import activity from "../utilities/activity.js";

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
    await activity(req, `แก้ไขการตั้งค่า ${name}`);
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
    await activity(req, `แก้ไขการตั้งค่า ${website.name}`);
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
    settings.value.logo =
      config.IO_CORS + "/services/website/" + settings.value.logo;
    settings.value.favicon =
      config.IO_CORS + "/services/website/" + settings.value.favicon;
    res.json({
      success: true,
      data: settings.value,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

const dashBoardData = async (req, res, next) => {
  try {
    const count = await updateDashboard(req);

    res.json({
      success: true,
      data: count,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

const allActivity = async (req, res, next) => {
  try {
    const result = await ActivityModel.find()
      .populate("user", "name email")
      .sort({ date: -1 });
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
  allSetting,
  updateSetting,
  updateSettingWebSite,
  websiteData,
  dashBoardData,
  allActivity,
};
