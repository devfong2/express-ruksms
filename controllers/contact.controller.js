import ContactModel from "./../models/contact.model.js";
import ContactListModel from "../models/contactList.model.js";
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
    console.log(req.body);
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
    const result = await ContactModel.insertMany(req.body.contacts);
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
