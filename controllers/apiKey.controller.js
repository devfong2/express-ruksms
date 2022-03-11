import jwt from "jsonwebtoken";
import ApiKeyModel from "../models/apiKey.model.js";

const generateToken = async (req, res, next) => {
  try {
    const { deviceCriteria, senders, tokenDetail, prioritize } = req.body;
    const token = jwt.sign(
      {
        user: req.user._id,
        deviceCriteria,
        senders,
        tokenDetail,
        prioritize,
      },
      req.user.apiKey
    );

    const result = await ApiKeyModel.create({
      user: req.user._id,
      token,
      tokenDetail,
      date: new Date(),
    });
    res.status(201).json({
      success: true,
      data: result,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

const allApiKey = async (req, res, next) => {
  try {
    const result = await ApiKeyModel.find({ user: req.user._id });
    res.status(200).json({
      success: true,
      data: result,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

const deleteApiKey = async (req, res, next) => {
  try {
    // console.log(req.body);
    const result = await ApiKeyModel.deleteMany({
      _id: { $in: req.body.idForDelete },
    });
    res.status(200).json({
      success: true,
      data: result,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

export default { generateToken, allApiKey, deleteApiKey };
