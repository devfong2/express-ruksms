import mongoose from "mongoose";
import config from "../config/index.js";

const connectDatabase = async () => {
  try {
    await mongoose.connect(config.DB_URI);
    console.log("connected database");
  } catch (error) {
    console.error(error);
  }
};

export default connectDatabase;
