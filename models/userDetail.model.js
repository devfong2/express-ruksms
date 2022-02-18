import mongoose from "mongoose";

const userDetailSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  knownFrom: String,
  verify: {
    type: Number,
    default: 1,
  },
  verifyImg: String,
  verifyDetail: String,
  suspend: {
    type: Number,
    default: 1,
  },
  suspendDetail: String,
});

export default mongoose.model("user-detail", userDetailSchema);
