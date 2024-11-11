const mongoose = require("mongoose");

const hardwareSchema = new mongoose.Schema({
  weight: {
    type: String,
    default: "N/A",
  },
  height: {
    type: String,
    default: "N/A",
  },
  bmi: {
    type: String,
    default: "123",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("bmi", hardwareSchema);
module.exports = User;
