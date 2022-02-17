import initialSetting from "./initialSetting.js";
import initialUser from "./initialUser.js";
export default async () => {
  try {
    await initialSetting();
    await initialUser();
  } catch (e) {
    console.log(e);
  }
};
