import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileImage: { type: String, default: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" },
  bio: { type: String, default: "" },
  teaches: [{ type: String }],
  learns: [{ type: String }],
  skillLevel: { type: String, enum: ["Beginner", "Intermediate", "Expert"], default: "Beginner" },
  matchScore: { type: Number, default: 0 },
  onlineStatus: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now },
  aiSummary: { type: String, default: "" }
}, { timestamps: true });

export const User = mongoose.model("User", UserSchema);
