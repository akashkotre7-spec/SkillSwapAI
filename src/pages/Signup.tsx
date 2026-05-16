import { useState } from "react";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db, handleFirestoreError, OperationType } from "../lib/firebase.ts";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Zap, Mail, Lock, User, BookOpen, GraduationCap, ArrowRight, Loader2 } from "lucide-react";
import { useStore } from "../lib/store.ts";

import { setStorageItem } from "../lib/storage.ts";

export default function Signup() {
  const setUser = useStore((state) => state.setUser);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    teaches: "",
    learns: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // 1. Create Auth User
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // 2. Update Profile Display Name
      await updateProfile(user, { displayName: formData.name });

      // 3. Create Firestore Document
      const userData = {
        userId: user.uid,
        name: formData.name,
        email: formData.email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
        teaches: [],
        learns: [],
        points: 0,
        gender: "other",
        preferredGender: "any",
        likedUsers: [],
        passedUsers: [],
        onboarded: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const userRef = doc(db, "users", user.uid);
      try {
        await setDoc(userRef, userData);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}`);
      }

      // Store in local storage for navigation logic (compatibility)
      setUser(userData as any);
      setStorageItem("user", userData);
      setStorageItem("token", "firebase-auth-active"); 
      
      navigate("/onboarding");
    } catch (err: any) {
      setError(err.message || "Signup failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-20 flex items-center justify-center px-6 relative overflow-hidden bg-brand-black bg-mesh">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full bg-brand-cyan/10 blur-[150px] -z-10" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl glass-card rounded-[40px] p-10 relative"
      >
        <Link to="/" className="flex items-center gap-2 justify-center mb-10 group">
          <div className="w-8 h-8 bg-gradient-to-tr from-brand-purple to-brand-cyan rounded-lg flex items-center justify-center glow-purple">
            <Zap className="text-white w-5 h-5 fill-white" />
          </div>
          <span className="text-xl font-display font-bold">SkillSwap</span>
        </Link>

        <h2 className="text-3xl font-display font-bold text-center mb-2">Create Account</h2>
        <p className="text-white/50 text-center text-sm mb-10">Join the future of peer-to-peer learning</p>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="text-xs font-bold text-white/40 uppercase tracking-wider ml-4 mb-2 block">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-brand-purple/50 transition-colors"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-white/40 uppercase tracking-wider ml-4 mb-2 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-brand-purple/50 transition-colors"
                  placeholder="you@example.com"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-white/40 uppercase tracking-wider ml-4 mb-2 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-brand-purple/50 transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-tr from-brand-purple to-brand-cyan rounded-2xl font-bold text-lg glow-purple flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 shadow-lg shadow-brand-purple/30"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Complete Signup <ArrowRight className="w-5 h-5" /></>}
          </button>
        </form>

        <p className="mt-8 text-center text-white/40 text-sm">
          Already have an account? <Link to="/login" className="text-brand-purple font-bold hover:underline">Log in</Link>
        </p>
      </motion.div>
    </div>
  );
}
