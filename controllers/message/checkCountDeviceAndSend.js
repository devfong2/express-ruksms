import DeviceModel from "../../models/device.model.js";
import processUssdRequest from "../../utilities/send-ussd.js";
export default async (user, groupID, senders, prioritize) => {
  const devices = [];
  senders.map((s) => {
    const sameDevice = devices.find((d) => d === s.device);
    if (!sameDevice) {
      devices.push(s.device);
    }
  });
  // console.log(devices);

  for (let i = 0; i < devices.length; i++) {
    const device = await DeviceModel.findById(devices[i]);
    if (!device) {
      break;
    }
    const obj = {
      delay: user.delay, // from user
      groupId: `${groupID}.${devices[i]}`,
      prioritize,
      reportDelivery: user.reportDelivery, // from user
      sleepTime: null, // from user
    };
    await processUssdRequest(device.token, obj);
    // console.log(result.data);
  }
};
