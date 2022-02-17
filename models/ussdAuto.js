import mongoose from "mongoose";
const ussdAutoSchema = new mongoose.Schema({
  request: {
    type: String,
    required: true,
  },
  device: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "device",
  },
  simSlot: {
    type: Number,
    required: true,
  },
  schedule: Date,
  times: {
    type: Number,
    default: 0,
  },
  timer: Number,
});

export default mongoose.model("ussd-auto", ussdAutoSchema);
