import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  subscribedDate: {
    type: Date,
    default: new Date(),
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  cyclesCompleted: {
    type: Number,
    default: null,
  },
  status: {
    type: String,
    default: "subscribed",
  },
  paymentMethod: {
    type: String,
    default: "transfer",
  },
  planID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "plan",
  },
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  gbpReferenceNo: String,
  referenceNo: { type: String, unique: true },
  amount: { type: Number, default: 0 },
});

export default mongoose.model("subscription", subscriptionSchema);
