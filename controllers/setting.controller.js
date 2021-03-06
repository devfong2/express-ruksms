import SettingModel from "../models/setting.model.js";
import ActivityModel from "../models/activity.model.js";
import config from "../config/index.js";
import uploadImage, { checkBase64Format } from "../utilities/upload-image.js";
import updateDashboard from "../utilities/update-dashboard.js";
import activity from "../utilities/activity.js";
import UserModel from "../models/user.model.js";
// import { hashPassword } from "../utilities/password.js";
// import { decryptData } from "../utilities/cryptoJs.js";
// import { encryptData } from "../utilities/cryptoJs.js";
// import axios from "axios";
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
    const verify = await SettingModel.findOne({ name: "verifySwitch" });
    const settings = await SettingModel.findOne({ name: "website" });
    settings.value.logo =
      config.IO_CORS + "/services/website/" + settings.value.logo;
    settings.value.favicon =
      config.IO_CORS + "/services/website/" + settings.value.favicon;

    settings.value.verifySwitch = verify.value;

    res.status(200).json({
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
    // console.log(req.headers.referer);
    const count = await updateDashboard(req);
    res.status(200).json({
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
    const { page, itemPerPage, searchBy, search } = req.query;

    let result = [];
    if (search !== "") {
      if (searchBy === "name") {
        const users = await UserModel.find({ name: new RegExp(search) }).select(
          "_id"
        );

        result = await Promise.all([
          ActivityModel.find({
            user: { $in: users.map((user) => user._id) },
          })
            .populate("user", "name email")
            .sort({ date: -1 })
            .limit(itemPerPage)
            .skip(page * itemPerPage),
          ActivityModel.find({
            user: { $in: users.map((user) => user._id) },
          }).countDocuments(),
        ]);
      } else if (searchBy === "email") {
        const users = await UserModel.find({
          email: new RegExp(search),
        }).select("_id");

        result = await Promise.all([
          ActivityModel.find({
            user: { $in: users.map((user) => user._id) },
          })
            .populate("user", "name email")
            .sort({ date: -1 })
            .limit(itemPerPage)
            .skip(page * itemPerPage),
          ActivityModel.find({
            user: { $in: users.map((user) => user._id) },
          }).countDocuments(),
        ]);
      } else if (searchBy === "activity") {
        result = await Promise.all([
          ActivityModel.find({
            activity: new RegExp(search),
          })
            .populate("user", "name email")
            .sort({ date: -1 })
            .limit(itemPerPage)
            .skip(page * itemPerPage),
          ActivityModel.find({
            activity: new RegExp(search),
          }).countDocuments(),
        ]);
      }
    } else {
      result = await Promise.all([
        ActivityModel.find()
          .populate("user", "name email")
          .sort({ date: -1 })
          .limit(itemPerPage)
          .skip(page * itemPerPage),
        ActivityModel.countDocuments(),
      ]);
    }
    res.json({
      success: true,
      data: { activities: result[0], count: result[1] },
      error: null,
    });
  } catch (e) {
    // console.log(e.message);
    next(e);
  }
};

const deleteActivity = async (req, res, next) => {
  try {
    const checkPin =
      // eslint-disable-next-line no-undef
      req.body.password === Buffer(config.PIN, "base64").toString("utf8");
    if (!checkPin) {
      throw new Error(`Incorrect pin`);
    }
    await ActivityModel.deleteMany();
    res.json({
      success: true,
      data: null,
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
  deleteActivity,
};
