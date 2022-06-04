import mongoose from "mongoose";
import config from "../config/index.js";
import initialDatabase from "../utilities/initial-database/index.js";

const connectDatabase = async () => {
  try {
    await mongoose.connect(config.MONGODB.URI, {
      authSource: "admin",
      user: config.MONGODB.USERNAME,
      pass: config.MONGODB.PASSWORD,
    });
    console.log("connected database");
    initialDatabase();
  } catch (error) {
    console.error(error);
  }
};

export default connectDatabase;
