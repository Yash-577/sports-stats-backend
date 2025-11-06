// test.js
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

try {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("✅ Connected to MongoDB successfully!");
  process.exit(0);
} catch (err) {
  console.error("❌ Connection failed:", err.message);
  process.exit(1);
}
