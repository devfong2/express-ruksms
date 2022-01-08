import mongoose from "mongoose";
const deviceSchema = new mongoose.Schema(
  {
    name: { type: String, default: null },
    ID: { type: Number, required: true, unique: true },
    token: { type: String, default: null },
    model: String,
    androidVersion: String,
    appVersion: String,
    userID: Number,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    androidId: { type: String, unique: true },
    enabled: {
      type: Number,
      enum: [0, 1],
      default: 0,
    },
    sims: [
      {
        name: String,
        carrier: String,
        country: String,
        iccID: String,
        number: {
          type: String,
          trim: true,
        },
        slot: Number,
        enabled: {
          type: Boolean,
          default: true,
        },
      },
    ],
    available: {
      type: Boolean,
      default: true,
    },
  },
  { toJSON: { virtuals: true } }
);

deviceSchema.path("enabled").options.enum;

deviceSchema.options.toJSON.transform = function (doc, obj) {
  delete obj._id;
  delete obj.__v;
};

const DeviceModel = mongoose.model("device", deviceSchema);
export default DeviceModel;
