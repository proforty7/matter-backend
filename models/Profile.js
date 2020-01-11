const mongoose = require("mongoose");
const { Schema } = mongoose;
const Project = require("./Project").schema;

const ProfileSchema = new Schema();

ProfileSchema.add({
  uid: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    minLength: 5
  },
  username: {
    type: String,
    required: true,
    unique: true,
    minLength: 5,
    trim: true,
    lowercase: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    match: /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/
  },
  projects: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: "project"
      }
    ],
    required: true,
    default: []
  }
});

module.exports = Profile = mongoose.model("profile", ProfileSchema);
