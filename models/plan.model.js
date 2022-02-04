import mongoose from "mongoose";

const planSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  credits: Number,
  devices: Number,
  contacts: Number,
  price: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: true,
  },
  frequency: {
    type: Number,
    required: true,
    default: 1,
  },
  frequencyUnit: {
    type: String,
    required: true,
  },
  totalCycles: {
    type: Number,

    default: 0,
  },
  paypalPlanID: String,
  enabled: {
    type: Number,
    required: true,
    default: 1,
  },
  sortPhone: {
    type: Number,
    default: 0,
  },
});

export default mongoose.model("plan", planSchema);
