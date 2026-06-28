const express = require("express");
const router = express.Router();
const {getContacts, getContact, createContact, updateContact, deleteContact} = require("../controllers/contactController.js");
const validateTokenHandler = require("../middleware/validateTokenHandler.js");

router.use(validateTokenHandler);
router.route("/").get(getContacts).post(createContact);
router.route("/:id").get(getContact).put(updateContact).delete(deleteContact);

module.exports = router;