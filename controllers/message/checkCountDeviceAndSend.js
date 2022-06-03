import DeviceModel from "../../models/device.model.js";
import processUssdRequest from "../../utilities/send-ussd.js";
export default async (
  user,
  groupID,
  senders,
  prioritize,
  customer,
  perMessage,
  userDelayFromAgent
) => {
  const devices = [];
  senders.map((s) => {
    const sameDevice = devices.find((d) => d === s.device);
    if (!sameDevice) {
      devices.push(s.device);
    }
  });
  // console.log(devices);
  const devicesInDB = await Promise.all(
    devices.map((d) => DeviceModel.findById(d))
  );
  const { second } = userDelayFromAgent;
  await Promise.all(
    devicesInDB.map((d) => {
      const obj = {
        delay: customer ? perMessage * second : user.delay, // from user and agent customer
        groupId: `${groupID}.${d._id}`,
        prioritize,
        reportDelivery: user.reportDelivery, // from user
        sleepTime: null, // from user
      };
      // console.log(obj);
      return processUssdRequest(d.token, obj);
    })
  );

  // for (let i = 0; i < devices.length; i++) {
  //   const device = await DeviceModel.findById(devices[i]);
  //   if (!device) {
  //     break;
  //   }
  //   const obj = {
  //     delay: customer ? perMessage * 2 : user.delay, // from user and agent customer
  //     groupId: `${groupID}.${devices[i]}`,
  //     prioritize,
  //     reportDelivery: user.reportDelivery, // from user
  //     sleepTime: null, // from user
  //   };
  //   await processUssdRequest(device.token, obj);
  //   // console.log(result.data);
  // }
};
