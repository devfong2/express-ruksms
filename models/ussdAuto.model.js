import mongoose from "mongoose";
const ussdAutoSchema = new mongoose.Schema({
  request: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "device",
    required: true,
  },
  device: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "device",
    required: true,
  },
  simSlot: {
    type: Number,
    required: true,
  },
  schedule: Date,
  times: {
    type: Number,
    default: 1,
  },
  round: {
    type: Number,
    default: 0,
  },
  timer: Number,
  date: Date,
  status: String,
});

export default mongoose.model("ussd-auto", ussdAutoSchema);
