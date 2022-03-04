import getQrCode from "../../utilities/gbprime/qrCode.js";
import userDetailModel from "../../models/userDetail.model.js";
export default async (req, res, next) => {
  try {
    const { amount, packageDetail } = req.body;
    const user = await userDetailModel.findOne({ user: req.user._id });
    const obj = {
      amount,
      referenceNo: "20220304016",
      detail: packageDetail,
      customerName: req.user.name || "",
      customerEmail: req.user.email || "",
      customerTelephone: req.user.phone || "",
      customerAddress: user.address,
    };
    // console.log(obj);
    const response = await getQrCode(obj);

    res.json({
      status: "success",
      // data: [],
      data: response.data,
      error: null,
    });
  } catch (e) {
    // console.log(e.response);
    next(e);
  }
};
