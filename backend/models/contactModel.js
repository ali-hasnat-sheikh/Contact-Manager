const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  userId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  email: {
    type: String,
    required: [false, "Email is optional"],
  },
  phone: {
    type: String,
    required: [true, "Phone is required"],
  },
  age: {
    type: Number,
    required: [false, "Age is optional"],
  },
}, {
  timestamps: true,
});

const Contact = mongoose.model("Contact", contactSchema);

module.exports = Contact;