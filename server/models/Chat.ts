import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
  unreadCount: { type: Map, of: Number, default: {} }
}, { timestamps: true });

export const Chat = mongoose.model("Chat", ChatSchema);

const MessageSchema = new mongoose.Schema({
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  image: { type: String },
  seen: { type: Boolean, default: false }
}, { timestamps: true });

export const Message = mongoose.model("Message", MessageSchema);
