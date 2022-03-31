import ApiDomainModel from "../../models/apiDomain.model.js";
export default async (req, callback) => {
  const domains = await ApiDomainModel.find({ user: req.user._id });

  if (domains.length > 0) {
    const whitelist = domains.map((item) => item.domain);
    if (
      whitelist.indexOf(req.header("Origin")) !== -1 ||
      !req.header("Origin")
    ) {
      callback(null, true);
    } else {
      const error = new Error("Not allowed by CORS");
      error.statusCode = 403;
      callback(error);
    }
  } else {
    const error = new Error("Not allowed by CORS");
    error.statusCode = 406;
    callback(error);
  }
};
