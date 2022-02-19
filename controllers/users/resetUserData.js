import MessageModel from "../../models/message.model.js";
import DeviceModel from "../../models/device.model.js";
import ContactModel from "../../models/contact.model.js";
import ContactListModel from "../../models/contactList.model.js";
import UssdModel from "../../models/ussd.model.js";
import UssdAutoModel from "../../models/ussdAuto.model.js";

export default async (req, res, next) => {
  try {
    const { user, title } = req.body;
    if (title === "รีเซ็ตข้อความ") {
      await MessageModel.deleteMany({ user });
    } else if (title === "รีเซ็ตกลุ่มรายชื่อผู้ติดต่อ") {
      const contactList = await ContactListModel.find({ userID: user });
      const contactListID = contactList.map((item) => item._id);
      await ContactModel.deleteMany({ contactListID: { $in: contactListID } });
      await ContactListModel.deleteMany({ userID: user });
    } else if (title === "รีเซ็ตรหัส USSD") {
      await UssdModel.deleteMany({ userID: user });
    } else if (title === "รีเซ็ตรหัส USSD Auto") {
      await UssdAutoModel.deleteMany({ user });
    } else if (title === "รีเซ็ตอุปกรณ์") {
      await DeviceModel.updateMany({ user }, { enabled: 0, available: false });
    } else if (title === "รีเซ็ตทั้งหมด") {
      const contactList = await ContactListModel.find({ userID: user });
      const contactListID = contactList.map((item) => item._id);
      await ContactModel.deleteMany({ contactListID: { $in: contactListID } });
      await ContactListModel.deleteMany({ userID: user });
      await MessageModel.deleteMany({ user });
      await UssdModel.deleteMany({ userID: user });
      await UssdAutoModel.deleteMany({ user });
      await DeviceModel.updateMany({ user }, { enabled: 0, available: false });
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
