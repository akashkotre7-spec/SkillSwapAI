import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Landing from "./pages/Landing.tsx";
import Login from "./pages/Login.tsx";
import Signup from "./pages/Signup.tsx";
import Discovery from "./pages/Discovery.tsx";
import ChatList from "./pages/ChatList.tsx";
import ChatRoom from "./pages/ChatRoom.tsx";
import Profile from "./pages/Profile.tsx";
import AICoach from "./pages/AICoach.tsx";
import Matches from "./pages/Matches.tsx";
import PublicProfile from "./pages/PublicProfile.tsx";
import Onboarding from "./pages/Onboarding.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import Settings from "./pages/Settings.tsx";
import Terms from "./pages/Terms.tsx";
import Privacy from "./pages/Privacy.tsx";
import CookieConsent from "./components/CookieConsent.tsx";
import BottomNav from "./components/BottomNav.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import { useStore } from "./lib/store.ts";
import { initSentry } from "./lib/sentry.ts";
import { auth, db, handleFirestoreError, OperationType } from "./lib/firebase.ts";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { AnimatePresence, motion } from "motion/react";
import { getStorageItem, setStorageItem } from "./lib/storage.ts";

function AppContent() {
  const { user, setUser } = useStore();
  const location = useLocation();

  useEffect(() => {
    initSentry();
    console.log(`[AppContent] Mounted at: ${location.pathname}`);
    
    let unsubFirestore: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      console.log("[Auth] State changed:", firebaseUser ? `UID: ${firebaseUser.uid}` : "Logged out");
      if (firebaseUser) {
        // Real-time sync with Firestore
        console.log("[Auth] User is verified:", firebaseUser.emailVerified);
        const userRef = doc(db, "users", firebaseUser.uid);
        unsubFirestore = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            const userData = doc.data() as any;
            console.log("[Firestore] User document synced:", firebaseUser.uid);
            setUser(userData);
            setStorageItem("user", userData);
          }
        }, (error) => {
          console.error("Firestore listener error:", error);
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
        });
      } else {
        if (unsubFirestore) {
          unsubFirestore();
          unsubFirestore = null;
        }
        setUser(null);
        localStorage.removeItem("user");
      }
    });

    return () => {
      unsubAuth();
      if (unsubFirestore) unsubFirestore();
    };
  }, [setUser]);

  return (
    <div className="min-h-screen bg-brand-black text-white selection:bg-brand-purple/30 flex flex-col w-full relative">
      {/* Cinematic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="orb-glow orb-purple animate-float opacity-50" />
        <div className="orb-glow orb-blue animate-float opacity-50" style={{ animationDelay: '-3.5s' }} />
      </div>
      
      <main className="flex-1 w-full flex flex-col relative z-10 min-h-screen">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          
          <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
          <Route path="/discovery" element={<ProtectedRoute><Discovery /></ProtectedRoute>} />
          <Route path="/matches" element={<ProtectedRoute><Matches /></ProtectedRoute>} />
          <Route path="/chats" element={<ProtectedRoute><ChatList /></ProtectedRoute>} />
          <Route path="/chat/:id" element={<ProtectedRoute><ChatRoom /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/coach" element={<ProtectedRoute><AICoach /></ProtectedRoute>} />
          <Route path="/profile/:userId" element={<ProtectedRoute><PublicProfile /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <div className="relative z-50">
        <BottomNav />
        <CookieConsent />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
