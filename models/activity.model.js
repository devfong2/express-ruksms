import mongoose from "mongoose";
const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  activity: String,
  ipAddress: String,
  date: Date,
  ipAddressDetail: Object,
});

export default mongoose.model("activity", activitySchema);
