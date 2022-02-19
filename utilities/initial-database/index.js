import initialSetting from "./initialSetting.js";
import initialUser from "./initialUser.js";
import initialUserDetail from "./initialUserDetail.js";
export default async () => {
  try {
    await initialSetting();
    await initialUser();
    await initialUserDetail();
  } catch (e) {
    console.log(e);
  }
};
