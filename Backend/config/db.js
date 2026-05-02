import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

const connectDB = async () => {
  const connect = async (uri) => {
    await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${uri}`);
  };

  try {
    if (process.env.MONGO_URI) {
      await connect(process.env.MONGO_URI);
      return;
    }
    throw new Error("No MONGO_URI provided");
  } catch (err) {
    console.warn("⚠️  MongoDB connection failed:", err.message);

    if (process.env.NODE_ENV === "production") {
      console.error("Production requires a valid MongoDB connection.");
      process.exit(1);
    }

    const mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await connect(uri);
    console.log("🧪 Connected to in-memory MongoDB for local development");
  }
};

export default connectDB;