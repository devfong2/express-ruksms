import SettingModel from "../../models/setting.model.js";
export default () => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    try {
      // 1==========================================================
      const mail = await SettingModel.findOne({ name: "mail" });
      if (!mail) {
        await SettingModel.create({
          name: "mail",
          value: {
            port: 587,
            host: "smtp.gmail.com",
            user: "support@ruksms.com",
            pass: "@@aa12345",
            from: "RUKSMS 🙏",
          },
        });
      }
      // 2 ==========================================================
      const maxMessageId = await SettingModel.findOne({ name: "maxMessageId" });
      if (!maxMessageId) {
        await SettingModel.create({
          name: "maxMessageId",
          value: 0,
        });
      }
      // 3 ==========================================================
      const newUser = await SettingModel.findOne({ name: "newUser" });
      if (!newUser) {
        await SettingModel.create({
          name: "newUser",
          value: {
            delay: 2,
            reportDelivery: 0,
            autoRetry: 0,
            credits: 200,
            contacts: 200,
            devices: 2,
            expiryAfter: 3,
            sortPhone: 10,
            messageFooter: {
              enable: 0,
              message: "Powered by RUKSMS",
            },
          },
        });
      }

      // 4 ==========================================================
      const website = await SettingModel.findOne({ name: "website" });
      if (!website) {
        await SettingModel.create({
          name: "website",
          value: {
            siteName: "RUKSMS",
            siteDescription:
              "บริการ SMS Gateway ผ่านระบบโทรศัพท์ Android เพื่อตอบสนองเป้าหมายทางธุรกิจของคุณ",
            logo: "logo.png",
            favicon: "favicon.png",
          },
        });
      }
      resolve(true);
    } catch (e) {
      reject(e);
    }
  });
};
