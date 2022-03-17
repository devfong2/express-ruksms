import app from "./app.js";
import config from "./config/index.js";
const start = () => {
  try {
    app.listen(config.PORT, () =>
      console.log("server is listenning on port " + config.PORT)
    );
  } catch (e) {
    console.error(e);
  }
};
start();
