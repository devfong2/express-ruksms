import mongoose from "mongoose";

const userDetailSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  knownFrom: String,
  verify: {
    type: Number,
    default: 0,
  },
  verifyImg: String,
  verifyDetail: {
    type: String,
    default: "ยังไม่ได้ทำการยืนยันตัวตน โปรดติดต่อผู้ดูแลระบบ",
  },
  suspend: {
    type: Number,
    default: 1,
  },
  suspendDetail: String,
  address: String,
});

export default mongoose.model("user-detail", userDetailSchema);
