import sendMessage from "./sendMessage.js";
import allMessage from "./allMessage.js";
import deleteMessage from "./deleteMessage.js";
import searchMessage from "./searchMessage.js";
import resendMessage from "./resendMessage.js";
import fetchMessageForAgent from "./fetchMessageForAgent.js";
import startStopMessage from "./startStopMessage.js";

//* test connect agent
import testConnect from "./testConnect.js";

export default {
  sendMessage,
  allMessage,
  deleteMessage,
  searchMessage,
  resendMessage,
  fetchMessageForAgent,
  startStopMessage,

  //* test connect agent
  testConnect,
};
