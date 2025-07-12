import mongoose from "mongoose";

const connectDB = async () => {
  const mongoDB_URL = process.env.MONGO_URI ?? "";

  try {
    await mongoose.connect(mongoDB_URL);
    console.log("MongoDB connected");
  } catch (error) {
    console.log("🚀 ~ connectDB ~ error:", error);
    console.error(error, "MongoDB connection error");
    process.exit(1);
  }
};

export default connectDB;
