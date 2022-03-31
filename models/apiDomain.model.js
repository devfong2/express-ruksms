import mongoose from "mongoose";

const apiDomainSchema = new mongoose.Schema({
  domain: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
});

const ApiDomainModel = mongoose.model("api-domain", apiDomainSchema);
export default ApiDomainModel;
