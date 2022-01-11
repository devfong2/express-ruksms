import processUssdRequest from "../utilities/send-ussd.js";
import createID from "../utilities/create-id.js";
import UssdModel from "../models/ussd.model.js";
import DeviceModel from "../models/device.model.js";
import PendingUssd from "../models/pendingUssd.js";

const sendUssdRequest = async (req, res, next) => {
  try {
    const device = await DeviceModel.findById(req.body.deviceID);
    if (!device) {
      throw new Error("ไม่พบข้อมูลอุปกรณ์");
    }

    if (device.enabled === 0) {
      throw new Error("การเชื่อมต่อของอุปกรณ์ขาดหาย");
    }

    if (device.available === false) {
      throw new Error("device not found");
    }
    // console.log(device);
    const deviceToken = device.token;

    const ussds = await UssdModel.find();
    const ID = await createID(ussds);
    const ussd = new UssdModel({
      ...req.body,
      ID,
      sendDate: new Date(),
    });
    await ussd.save();
    // console.log(ussd);
    const data = {
      ussdId: ussd.ID,
      ussdRequest: req.body.request,
      simSlot: req.body.simSlot,
    };
    await processUssdRequest(deviceToken, data);
    await ussd.populate("deviceID");
    await ussd.populate("userID");

    res.json({
      success: true,
      data: ussd,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

const allUssd = async (req, res, next) => {
  try {
    const ussds = await UssdModel.find()
      .populate("deviceID")
      .populate("userID");
    res.json({
      success: true,
      data: ussds,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

const deleteUssd = async (req, res, next) => {
  try {
    await UssdModel.deleteMany({
      ID: { $in: req.body.selectedUssd },
    });
    const ussds = await UssdModel.find()
      .populate("deviceID")
      .populate("userID");
    res.json({
      success: true,
      data: ussds,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

const sendUssdManyRequest = async (req, res, next) => {
  try {
    const result = await PendingUssd.insertMany(req.body.manyUssd);
    manageSendUssdManyRequest();
    res.json({
      success: true,
      data: result,
      error: null,
    });
  } catch (e) {
    next(e);
  }
};

const manageSendUssdManyRequest = async () => {
  try {
    let pendingUssd = await PendingUssd.find();
    while (pendingUssd.length !== 0) {
      // insert to ussd model
      const ussds = await UssdModel.find();
      const device = await DeviceModel.findById(pendingUssd[0].deviceID);
      const ID = await createID(ussds);
      const ussd = new UssdModel({
        request: pendingUssd[0].request,
        userID: pendingUssd[0].userID,
        deviceID: pendingUssd[0].deviceID,
        simSlot: pendingUssd[0].simSlot,
        ID,
        sendDate: new Date(),
      });
      await ussd.save();

      const data = {
        ussdId: ussd.ID,
        ussdRequest: ussd.request,
        simSlot: ussd.simSlot,
      };
      // รอส่งข้อความ
      const timer = setTimeout(async () => {
        await processUssdRequest(device.token, data);
        clearTimeout(timer);
      }, 1000);
      //ส่งแล้วก้อลบ
      await PendingUssd.findByIdAndDelete(pendingUssd[0]._id);

      //เช็คใหม่
      pendingUssd = await PendingUssd.find();
      console.log(pendingUssd.length);
    }
  } catch (e) {
    console.error(e);
  }
};

// const inertToUssdModelAndSendUssd = async(value)=>{
//   try{
//     const ussds = await UssdModel.find();
//     const device = await DeviceModel.findById(value.deviceID);
//     const ID = await createID(ussds);
//     const ussd = new UssdModel({
//       request: value.request,
//       userID: value.userID,
//       deviceID: value.deviceID,
//       simSlot: value.simSlot,
//       ID,
//       sendDate: new Date(),
//     });
//     await ussd.save();

//     const data = {
//       ussdId: ussd.ID,
//       ussdRequest: ussd.request,
//       simSlot: ussd.simSlot,
//     };
//     await processUssdRequest(device.token, data);
//     await PendingUssd.findByIdAndDelete(value._id);
//   }catch(e){
//     console.error(e);
//   }
// }

export default {
  sendUssdRequest,
  allUssd,
  deleteUssd,
  sendUssdManyRequest,
};
