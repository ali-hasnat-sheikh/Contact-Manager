const contactModel = require("../models/contactModel.js");
const asyncHandler = require("express-async-handler");

// @desc Get all contacts
// @route GET /api/contacts
// @access Private

const getContacts = asyncHandler(async (req, res) => {

    const contacts = await contactModel.find({ userId: req.user.id });
    res.status(200).json(contacts);
});

// @desc Get a contact
// @route GET /api/contacts/:id
// @access Private

const getContact = asyncHandler(async (req, res) => {
  const contact = await contactModel.findOne({ userId: req.user.id, _id: req.params.id });
  if(!contact) {
    res.status(404);
    throw new Error("Contact not found");
  }
  res.status(200).json(contact);
});

// @desc Create a contact
// @route POST /api/contacts
// @access Private

const createContact = asyncHandler(async (req, res) => {
    const { name, phone, email, age} = req.body;
    if (!name || !phone) {
        res.status(400);
        throw new Error("Please fill the required fields");
        return;
    }
  const contact = await contactModel.create({ name, phone, email, age, userId: req.user.id });
  res.status(201).json(contact);
});

// @desc Update a contact
// @route PUT /api/contacts/:id
// @access Private

const updateContact = asyncHandler(async (req, res) => {
  const contact = await contactModel.findOneAndUpdate({
    _id: req.params.id,
    userId: req.user.id,
  },
  { $set: req.body },
  { returnDocument: 'after' }
  );
  if(!contact) {
    res.status(404);
    throw new Error("Contact not found");
    return;
  }
  res.status(200).json(contact);
});

// @desc Delete a contact
// @route DELETE /api/contacts/:id
// @access Private

const deleteContact = asyncHandler(async (req, res) => {
  const contact = await contactModel.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  if(!contact) {
    res.status(404);
    throw new Error("Contact not found");
  }
  res.status(200).json(contact);
});

module.exports = {
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact
};