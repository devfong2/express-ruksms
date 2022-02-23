import mongoose from "mongoose";

const OffensiveWordSchema = new mongoose.Schema({
  word: {
    type: String,
    required: true,
  },
  reason: String,
});

export default mongoose.model("offensiveword", OffensiveWordSchema);
