import { Response } from "express";
import mongoose from "mongoose";
import { AuthRequest } from "../middleware/auth.ts";
import { User } from "../models/User.ts";
import { Match } from "../models/Match.ts";
import { Chat } from "../models/Chat.ts";

export const getDiscoveryUsers = async (req: AuthRequest, res: Response) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "Database disconnected" });
    }
    const currentUserId = req.user?.id;
    // Get users that current user hasn't interacted with yet
    // For MVP, just get all other users
    const users = await User.find({ _id: { $ne: currentUserId } }).limit(20);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const handleSwipe = async (req: AuthRequest, res: Response) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "Database disconnected" });
    }
    const { targetUserId, direction } = req.body;
    const currentUserId = req.user?.id;

    if (direction === "right") {
      // Check if target user already swiped right on current user
      const existingMatch = await Match.findOne({
        users: { $all: [currentUserId, targetUserId] },
        status: "pending"
      });

      if (existingMatch) {
        // MATCH!
        existingMatch.status = "matched";
        await existingMatch.save();

        // Create a Chat
        const chat = new Chat({
          participants: [currentUserId, targetUserId]
        });
        await chat.save();

        return res.json({ matched: true, chat });
      } else {
        // Create pending match
        const newMatch = new Match({
          users: [currentUserId, targetUserId],
          status: "pending"
        });
        await newMatch.save();
        return res.json({ matched: false });
      }
    }

    res.json({ matched: false });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getMatches = async (req: AuthRequest, res: Response) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "Database disconnected" });
    }
    const currentUserId = req.user?.id;
    const matches = await Match.find({
      users: currentUserId,
      status: "matched"
    }).populate("users", "name profileImage teaches learns");
    res.json(matches);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
