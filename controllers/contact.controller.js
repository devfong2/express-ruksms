import ContactModel from "./../models/contact.model.js";
import ContactListModel from "../models/contactList.model.js";
import activity from "../utilities/activity.js";
// import UserModel from "../models/user.model.js";
const allContact = async (req, res, next) => {
  try {
    const contactList = await ContactListModel.find({ userID: req.user._id });
    const contactListID = contactList.map((c) => c._id);
    // console.log(contactListID);
    const result = await ContactModel.find({
      contactListID: { $in: contactListID },
    });
    res.json({
      success: true,
      data: result,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

const findContactWithOption = async (req, res, next) => {
  try {
    const { option } = req.body;
    // console.log(req.body);
    if (!option) {
      throw new Error("option is required");
    }
    const result = await ContactModel.find(option);
    res.json({
      success: true,
      data: result,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

const createContact = async (req, res, next) => {
  try {
    // console.log(req.user);
    const { contacts } = req.body;
    const contactsListOfUser = await ContactListModel.find({
      userID: req.user._id,
    });
    const idContactList = contactsListOfUser.map((c) => c._id);
    const contactsNet = await ContactModel.find({
      contactListID: { $in: idContactList },
    });
    const contactTotal = contactsNet.length + contacts.length;
    if (
      req.user.contactsLimit !== null &&
      req.user.contactsLimit < contactTotal
    ) {
      throw new Error("The list exceeds the limit.Please upgrade your account");
    }
    const result = await ContactModel.insertMany(contacts);
    await activity(
      req.user._id,
      `เพิ่มรายชื่อผู้ติดต่อ ${result.length} รายชื่อ`
    );

    res.json({
      success: true,
      data: result,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

const updateContact = async (req, res, next) => {
  try {
    const result = await ContactModel.updateMany(
      { _id: { $in: req.body.contactID } },
      req.body.contactUpdate
    );
    await activity(req.user._id, `แก้ไขรายชื่อผู้ติดต่อ`);
    res.json({
      success: true,
      data: result,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

const deleteContact = async (req, res, next) => {
  try {
    const result = await ContactModel.deleteMany({
      _id: { $in: req.body.contactID },
    });
    await activity(req.user._id, `ลบรายชื่อผู้ติดต่อ`);
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
  allContact,
  createContact,
  updateContact,
  deleteContact,
  findContactWithOption,
};
