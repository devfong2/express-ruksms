import mongoose from "mongoose";
const contactListSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
});

export default mongoose.model("contact-list", contactListSchema);
