import UserModel from "../../models/user.model.js";
import ContactListModel from "../../models/contactList.model.js";
import ContactModel from "../../models/contact.model.js";
import MessageModel from "../../models/message.model.js";
import UssdModel from "../../models/ussd.model.js";
import TemplateModel from "../../models/template.model.js";
import DeviceModel from "../../models/device.model.js";
import activity from "../../utilities/activity.js";
export default async (req, res, next) => {
  try {
    const { idForDelete } = req.body;
    if (!idForDelete) {
      throw new Error("idForDelete is required");
    }
    if (!Array.isArray(idForDelete)) {
      throw new Error(
        "idForDelete must be array.Example idForDelete:['61ea2b2d5e02bae9674dfec1','61ea2b2d5e02bae9674dfec2']"
      );
    }

    // ============================================================
    for (let i = 0; i < idForDelete.length; i++) {
      const contactList = await ContactListModel.find({
        userID: idForDelete[i],
      });
      for (let k = 0; k < contactList.length; k++) {
        await ContactModel.deleteMany({ contactListID: contactList[k]._id });
      }

      await MessageModel.deleteMany({ user: idForDelete[i] });
      await UssdModel.deleteMany({ userID: idForDelete[i] });
      await TemplateModel.deleteMany({ userID: idForDelete[i] });
      await DeviceModel.updateMany(
        { user: idForDelete[i] },
        { enabled: 0, available: false }
      );
      const user = await UserModel.findByIdAndDelete(idForDelete[i]);
      await activity(req, `ลบบัญชีผู้ใช้งาน ${user.email}`);
    }
    res.json({
      success: true,
      data: null,
      error: null,
    });
  } catch (e) {
    // console.log(e);
    next(e);
  }
};
