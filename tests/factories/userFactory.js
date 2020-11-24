const mongoose = require("mongoose");
const User = mongoose.model("User");

module.exports = () => {
  const googleId = Math.random() * (9999999 - 1000000) + 1000000;
  const displayName = `user-${Math.random() * (9999999 - 1000000) + 1000000}`;
  return new User({ googleId, displayName }).save();
};
