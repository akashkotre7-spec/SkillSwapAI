import express from "express";
import * as authController from "../controllers/authController.ts";
import * as userController from "../controllers/userController.ts";
import { authMiddleware } from "../middleware/auth.ts";

const router = express.Router();

// Auth
router.post("/signup", authController.signup);
router.post("/login", authController.login);

// Users & Discovery
router.get("/discovery", authMiddleware, userController.getDiscoveryUsers);
router.post("/swipe", authMiddleware, userController.handleSwipe);
router.get("/matches", authMiddleware, userController.getMatches);

export default router;
