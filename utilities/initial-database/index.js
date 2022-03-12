import initialSetting from "./initialSetting.js";
import initialUser from "./initialUser.js";
import initialUserDetail from "./initialUserDetail.js";
// import initialMessage from "./initialMessage.js";
export default async () => {
  try {
    await initialSetting();
    await initialUser();
    await initialUserDetail();
    // await initialMessage()
  } catch (e) {
    console.log(e);
  }
};
