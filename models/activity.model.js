import mongoose from "mongoose";
const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  activity: String,
  ipAddress: String,
  date: Date,
});

export default mongoose.model("activity", activitySchema);
