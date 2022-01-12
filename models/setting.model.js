import mongoose from "mongoose";

const settingShema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  value: mongoose.SchemaTypes.Mixed,
});

const SettingModel = mongoose.model("setting", settingShema);
export default SettingModel;
