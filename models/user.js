const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 3 },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
    },
    email: { type: String, trim: true, lowercase: true, default: "" },
    password: { type: String, required: true, minlength: 6, select: false },
    role: {
      type: String,
      enum: ["manager", "agent", "director"],
      required: true,
    },
    branch: {
      type: String,
      enum: ["Maganjo", "Matugga"],
      required: true,
    },
    contact: { type: String, default: "" },
    location: { type: String, trim: true, default: "" }, // NEW FIELD
    photo: { type: String, default: "" }, // NEW FIELD - URL to profile photo
    active: { type: Boolean, default: true },
    resetOtp: { type: String },
    resetOtpExpiry: { type: Date },
  },
  { timestamps: true },
);

// Indexes for performance (username already has unique index from schema)
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1, branch: 1 });
UserSchema.index({ active: 1 });
UserSchema.index({ location: 1 }); // NEW INDEX
UserSchema.index({ photo: 1 }); // NEW INDEX

// Hash password before save
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
UserSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

// Never expose password
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", UserSchema);
