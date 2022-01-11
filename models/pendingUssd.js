import mongoose from "mongoose";

const pendingUssdSchema = new mongoose.Schema({
  request: {
    type: String,
    required: true,
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
  date: {
    type: Date,
    default: new Date(),
  },
});

const PendingUssd = mongoose.model("pending-ussd", pendingUssdSchema);
export default PendingUssd;
