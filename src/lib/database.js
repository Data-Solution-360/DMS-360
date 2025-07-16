import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

let connection = {};

async function connectDB() {
  if (connection.isConnected) {
    return;
  }

  try {
    const db = await mongoose.connect(MONGODB_URI);
    connection.isConnected = db.connections[0].readyState;
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

async function disconnectDB() {
  if (connection.isConnected) {
    await mongoose.disconnect();
    connection.isConnected = 0;
    console.log("MongoDB disconnected");
  }
}

export { connectDB, disconnectDB };
