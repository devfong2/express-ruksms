import mongoose from "mongoose";

const templateShema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
});

const TemplateModel = mongoose.model("template", templateShema);
export default TemplateModel;
