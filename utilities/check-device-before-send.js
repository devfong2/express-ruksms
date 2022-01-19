const checkDeviceBeforeSend = (device, simSlot) => {
  return new Promise((resolve, reject) => {
    if (!device) {
      reject(new Error("Device not found"));
    }

    if (!device.available) {
      reject(new Error("Device not found"));
    }

    if (device.enabled === 0) {
      reject(new Error(`${device.model} is disconnected`));
    }
    if (!device.sims[simSlot]) {
      reject(new Error(`${device.model} sim ${simSlot + 1} not found`));
    }
    if (!device.sims[simSlot].enabled) {
      reject(new Error(`${device.model} sim ${simSlot + 1} unavailable`));
    }
    resolve(device);
  });
};

export default checkDeviceBeforeSend;
