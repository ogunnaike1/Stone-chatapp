const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  text: { type: String, required: true },
  time: { type: String, required: true },
});

module.exports = mongoose.model("Message", MessageSchema);