const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: { type: String, required: true, minLength: 3, maxLength: 100 },
  password: { type: String, required: true, minLength: 3, maxLength: 100 },
  role: [{type: String, required: true, default: 'basic', enum: ["basic", "supervisor", "admin"]}],
 // accessToken: {type: String},
});

// Export model
module.exports = mongoose.model("User", UserSchema);
