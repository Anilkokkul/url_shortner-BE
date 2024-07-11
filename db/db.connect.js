const mongoose = require("mongoose");

exports.db = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("DB connection successful");
  } catch (error) {
    console.log("Error while connect DB...", error);
  }
};
