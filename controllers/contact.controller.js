import ContactModel from "./../models/contact.model.js";

const allContact = async (req, res, next) => {
  try {
    const result = await ContactModel.find();
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

export default { allContact, createContact, updateContact, deleteContact };
