import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    ID: { type: Number, required: true, unique: true },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    apiKey: {
      type: String,
      required: true,
      unique: true,
    },
    isAdmin: {
      type: Number,
      required: true,
      default: 0,
    },
    primaryDeviceID: {
      type: Number,
      required: true,
      default: 0,
    },
    dateAdded: {
      type: Date,
      required: true,
      default: new Date(),
    },
    lastLogin: {
      type: Date,
      required: true,
      default: new Date(),
    },
    delay: {
      type: Number,
      required: true,
      default: 1,
    },
    webHook: { type: String, default: null },
    devicesLimit: { type: Number, default: null },
    contactsLimit: { type: Number, default: null },
    credits: { type: Number, default: null },
    expiryDate: { type: Date, default: null },
    timeZone: {
      type: String,
      required: true,
      default: "Asia/Bangkok",
    },
    reportDelivery: {
      type: Number,
      required: true,
      default: 0,
    },
    autoRetry: {
      type: Number,
      required: true,
      default: 0,
    },
    smsToEmail: {
      type: Number,
      required: true,
      default: 0,
    },
    receivedSmsEmail: { type: String, default: null },
    sleepTime: { type: String, default: null },
    language: {
      type: String,
      required: true,
      default: "english",
    },
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "subscription",
    },
    sortPhone: {
      type: Number,
      default: null,
    },
    phone: String,
  },
  { toJSON: { virtuals: true } }
);

userSchema.options.toJSON.transform = function (doc, obj) {
  // remove the _id of every document before returning the result
  delete obj._id;
  delete obj.__v;
};
userSchema.virtual("userDetail", {
  ref: "user-detail",
  localField: "_id",
  foreignField: "user",
});

const UserModel = mongoose.model("user", userSchema);

export default UserModel;
