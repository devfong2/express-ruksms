import ContactListModel from "../models/contactList.model.js";
import ContactModel from "./../models/contact.model.js";
import activity from "../utilities/activity.js";
const allContactList = async (req, res, next) => {
  try {
    const result = await ContactListModel.find({ userID: req.user._id });
    res.json({
      success: true,
      data: result,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

const createContactList = async (req, res, next) => {
  try {
    const result = await ContactListModel.create(req.body);
    await activity(req.user._id, "สร้างกลุ่มรายชื่อผู้ติดต่อ");
    res.json({
      success: true,
      data: result,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

const updateContactList = async (req, res, next) => {
  try {
    const result = await ContactListModel.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true }
    );
    await activity(req.user._id, "แก้ไขกลุ่มรายชื่อผู้ติดต่อ");
    res.json({
      success: true,
      data: result,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

const deleteContactList = async (req, res, next) => {
  try {
    const result = await ContactListModel.findByIdAndDelete(req.params.id);
    await ContactModel.deleteMany({ contactListID: req.params.id });
    await activity(req.user._id, "ลบกลุ่มรายชื่อผู้ติดต่อ");
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
  allContactList,
  createContactList,
  updateContactList,
  deleteContactList,
};
