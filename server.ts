import express from "express";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

// Pre-load models for mongoose
import "./server/models/User.ts";
import "./server/models/Match.ts";
import "./server/models/Chat.ts";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(async () => {
      console.log("Connected to MongoDB Atlas");
      // Seed initial data if empty
      const userCount = await mongoose.model("User").countDocuments();
      if (userCount === 0) {
        console.log("Seeding initial users...");
        const users = [
          { name: "Sarah Chen", email: "sarah@skillswap.ai", password: "password123", profileImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800", teaches: ["UX/UI", "Figma", "Branding"], learns: ["Python", "React"], skillLevel: "Expert" },
          { name: "Alex Rover", email: "alex@skillswap.ai", password: "password123", profileImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800", teaches: ["Node.js", "MongoDB", "DevOps"], learns: ["Spanish", "Martial Arts"], skillLevel: "Expert" },
          { name: "Mia Wong", email: "mia@skillswap.ai", password: "password123", profileImage: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800", teaches: ["Digital Marketing", "SEO"], learns: ["Illustration", "Photography"], skillLevel: "Intermediate" },
          { name: "Leo Silva", email: "leo@skillswap.ai", password: "password123", profileImage: "https://images.unsplash.com/photo-1492562080023-ab3dbdf5bb3d?w=800", teaches: ["Piano", "Music Theory"], learns: ["Swift", "Game Design"], skillLevel: "Expert" }
        ];
        const bcrypt = await import("bcryptjs");
        for (const u of users) {
          u.password = await bcrypt.default.hash(u.password, 10);
        }
        await mongoose.model("User").insertMany(users);
        console.log("Seeding complete.");
      }
    })
    .catch((err) => console.error("MongoDB Connection Error:", err));
} else {
  console.warn("MONGODB_URI not found in environment. Database features will be disabled.");
}

// Socket.io Connection
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join_chat", (chatId) => {
    socket.join(chatId);
    console.log(`User joined chat: ${chatId}`);
  });

  socket.on("send_message", (data) => {
    // data: { chatId, senderId, text, timestamp }
    io.to(data.chatId).emit("receive_message", data);
  });

  socket.on("typing", (data) => {
    socket.to(data.chatId).emit("user_typing", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// API Routes
import apiRoutes from "./server/routes/api.ts";
app.use("/api", apiRoutes);

// Mock Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", db: mongoose.connection.readyState === 1 ? "connected" : "disconnected" });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
