import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  ID: {
    type: Number,
    required: true,
    unique: true,
  },
  number: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  schedule: {
    type: Number,
    default: null,
  },
  sentDate: {
    type: Date,
    default: null,
  },
  deliveredDate: {
    type: Date,
    default: null,
  },
  expiryDate: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    required: true,
    default: "Pending",
  },
  resultCode: {
    type: Number,
    default: null,
  },
  errorCode: {
    type: Number,
    default: null,
  },
  retries: {
    type: Number,
    required: true,
    default: 0,
  },
  userID: {
    type: Number,
    required: true,
  },
  deviceID: {
    type: Number,
    default: null,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  device: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "device",
  },
  simSlot: { type: Number, default: null },
  groupID: { type: String, default: null },
  type: {
    type: String,
    enum: ["sms", "mms"],
    required: true,
    default: "sms",
  },
  attachments: { type: String, default: null },
  prioritize: { type: Number, required: true, default: 0 },
});

messageSchema.path("type").options.enum;

export default mongoose.model("message", messageSchema);
