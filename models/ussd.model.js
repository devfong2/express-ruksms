import mongoose from "mongoose";

const ussdSchema = new mongoose.Schema({
  ID: { type: Number, required: true, unique: true },
  request: {
    type: String,
    required: true,
  },
  response: {
    type: String,
    default: "รอดำเนินการ",
  },
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  deviceID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "device",
    required: true,
  },
  simSlot: {
    type: Number,
    required: true,
  },
  sendDate: {
    type: Date,
    required: true,
  },
  responseDate: {
    type: String,
    default: "รอดำเนินการ",
  },
});

const UssdModel = mongoose.model("ussd", ussdSchema);

export default UssdModel;
