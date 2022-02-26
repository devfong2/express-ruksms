import axios from "axios";

axios.defaults.baseURL = "https://www.google.com/recaptcha/api";
import config from "../../config/index.js";
export default async (req, res, next) => {
  try {
    const { token } = req.body;
    const response = await axios.get(
      `/siteverify?secret=${config.GOOGLE_RECAPTCHA_SECRET_KEY}&response=${token}`
    );
    // console.log(response);
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
