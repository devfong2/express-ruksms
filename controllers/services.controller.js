import registerDevice from "./services/register-device.js";
import getMessages from "./services/get-messages.js";
import reportStatus from "./services/report-status.js";
import ussdResponse from "./services/ussd-response.js";
import signOut from "./services/sign-out.js";
import signIn from "./services/sign-in.js";
import updateToken from "./services/update-token.js";
import receiveMessage from "./services/receive-message.js";

export default {
  registerDevice,
  updateToken,
  signIn,
  ussdResponse,
  signOut,
  getMessages,
  reportStatus,
  receiveMessage,
};
