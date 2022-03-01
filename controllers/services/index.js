import registerDevice from "./register-device.js";
import getMessages from "./get-messages.js";
import reportStatus from "./report-status.js";
import ussdResponse from "./ussd-response.js";
import signOut from "./sign-out.js";
import signIn from "./sign-in.js";
import updateToken from "./update-token.js";
import receiveMessage from "./receive-message.js";

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
