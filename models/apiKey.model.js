import mongoose from "mongoose";

const apiKeySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  token: {
    type: String,
    required: true,
  },
  tokenDetail: {
    type: String,
    required: true,
  },
  date: Date,
});

const ApiKeyModel = mongoose.model("api-key", apiKeySchema);
export default ApiKeyModel;
