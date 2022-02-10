import UssdModel from "../models/ussd.model.js";
import DeviceModel from "../models/device.model.js";
import processUssdRequest from "./send-ussd.js";
export default async (io) => {
  try {
    let pendingUssd = await UssdModel.find({
      response: "รอดำเนินการ",
    }).limit(10);
    while (pendingUssd.length !== 0) {
      const data = {
        ussdId: pendingUssd[0].ID,
        ussdRequest: pendingUssd[0].request,
        simSlot: pendingUssd[0].simSlot,
      };
      const device = await DeviceModel.findById(pendingUssd[0].deviceID);
      // รอส่งข้อความ

      await processUssdRequest(device.token, data);
      //ส่งแล้วก้อเปลี่ยนสถานะ
      const ussd = await UssdModel.findByIdAndUpdate(
        pendingUssd[0]._id,
        {
          response: "รอผลตอบกลับ",
        },
        { new: true }
      );
      io.emit("updateUssd", ussd);
      // console.log(ussd);

      //เช็คใหม่
      pendingUssd = await UssdModel.find({
        response: "รอดำเนินการ",
      }).limit(10);
      // console.log(pendingUssd.length);
    }
  } catch (e) {
    console.error(e);
  }
};
