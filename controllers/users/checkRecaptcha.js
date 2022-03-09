import axios from "axios";

import config from "../../config/index.js";
export default async (req, res, next) => {
  try {
    const { token } = req.body;
    const option = {
      method: "get",
      url: `https://www.google.com/recaptcha/api/siteverify?secret=${config.GOOGLE_RECAPTCHA_SECRET_KEY}&response=${token}`,
    };
    const response = await axios(option);
    // console.log(response.data);
    if (!response.data.success) {
      throw new Error("Captcha not valid");
    }
    res.json({
      success: true,
      data: null,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};
