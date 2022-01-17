import mongoose from "mongoose";
const contactSchema = new mongoose.Schema({
  name: String,
  number: String,
  subscribed: {
    type: Number,
    enum: [0, 1],
    default: 1,
  },
  contactListID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "contact-list",
    required: true,
  },
});

contactSchema.path("subscribed").options.enum;

export default mongoose.model("contact", contactSchema);
