import mongoose from "mongoose";

const MatchSchema = new mongoose.Schema({
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  compatibilityScore: { type: Number },
  aiReason: { type: String },
  status: { type: String, enum: ["pending", "matched", "rejected"], default: "pending" }
}, { timestamps: true });

export const Match = mongoose.model("Match", MatchSchema);
