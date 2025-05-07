const mongoose = require("mongoose");
const argon2 = require("argon2");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    try {
      this.password = await argon2.hash(this.password);
    } catch (err) {
      return next(err);
    }
  }
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await argon2.verify(this.password, candidatePassword);
  } catch (err) {
    throw err;
  }
};

UserSchema.index({ username: "text" });

const User = mongoose.model("User", UserSchema);

module.exports = User;
