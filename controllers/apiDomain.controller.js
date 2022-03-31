import ApiDomainModel from "../models/apiDomain.model.js";
import activity from "../utilities/activity.js";

export const allApiDomain = async (req, res, next) => {
  try {
    const result = await ApiDomainModel.find({ user: req.user._id });
    res.status(200).json({
      success: true,
      data: result,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

export const createApiDomain = async (req, res, next) => {
  try {
    const { domain } = req.body;
    if (!domain || domain === "") {
      throw new Error("domain is required");
    }
    const apiDomain = await ApiDomainModel.create({
      domain,
      user: req.user._id,
    });
    activity(req, `เพิ่ม domain : ${domain}`);
    res.status(201).json({
      success: true,
      data: apiDomain,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

export const updateApiDomain = async (req, res, next) => {
  try {
    const { id } = req.params;
    const apiDomain = await ApiDomainModel.findById(id);
    if (!apiDomain) {
      const err = new Error(`${id} not found`);
      err.statusCode = 404;
      throw err;
    }
    const { domain } = req.body;
    if (!domain || domain === "") {
      throw new Error("domain is required");
    }
    apiDomain.domain = domain;
    await apiDomain.save();
    activity(req, `แก้ไข domain : ${domain}`);
    res.status(201).json({
      success: true,
      data: apiDomain,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

export const deleteApiDomain = async (req, res, next) => {
  try {
    const { id } = req.params;
    const apiDomain = await ApiDomainModel.findById(id);
    if (!apiDomain) {
      const err = new Error(`${id} not found`);
      err.statusCode = 404;
      throw err;
    }
    await ApiDomainModel.deleteOne({ _id: apiDomain._id });
    activity(req, `ลบ domain : ${apiDomain.domain}`);
    res.status(201).json({
      success: true,
      data: null,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};
