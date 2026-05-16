import { useState } from "react";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db, handleFirestoreError, OperationType, googleProvider, githubProvider } from "../lib/firebase.ts";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { Zap, Mail, Lock, ArrowRight, Loader2, Github } from "lucide-react";
import { useStore } from "../lib/store.ts";

import { setStorageItem } from "../lib/storage.ts";

export default function Login() {
  const setUser = useStore((state) => state.setUser);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSocialLogin = async (provider: any) => {
    setLoading(true);
    setError("");
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      let userData;
      if (!userSnap.exists()) {
        // Create bio for new social user
        userData = {
          userId: user.uid,
          name: user.displayName || "Explorer",
          email: user.email || "",
          avatar: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
          teaches: [],
          learns: [],
          points: 100,
          xp: 0,
          level: 1,
          role: "user",
          gender: "other",
          preferredGender: "any",
          onboarded: false,
          likedUsers: [],
          passedUsers: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        await setDoc(userRef, userData);
      } else {
        userData = userSnap.data();
      }

      setUser(userData as any);
      setStorageItem("user", userData);
      setStorageItem("token", "firebase-auth-active");
      
      if (userData.onboarded) {
        navigate("/discovery");
      } else {
        navigate("/onboarding");
      }
    } catch (err: any) {
      setError(err.message || "Social login failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch Firestore user data
      const userRef = doc(db, "users", user.uid);
      try {
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser(userData as any);
          setStorageItem("user", userData);
          setStorageItem("token", "firebase-auth-active");
          navigate("/discovery");
        } else {
          setError("User profile not found.");
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden bg-brand-black bg-mesh">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full bg-brand-purple/10 blur-[150px] -z-10" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass-card rounded-[40px] p-10 relative"
      >
        <Link to="/" className="flex items-center gap-2 justify-center mb-10 group">
          <div className="w-8 h-8 bg-gradient-to-tr from-brand-purple to-brand-cyan rounded-lg flex items-center justify-center glow-purple transition-transform group-hover:scale-110">
            <Zap className="text-white w-5 h-5 fill-white" />
          </div>
          <span className="text-xl font-display font-bold">SkillSwap</span>
        </Link>

        <h2 className="text-3xl font-display font-bold text-center mb-2">Welcome Back</h2>
        <p className="text-white/50 text-center text-sm mb-10">Continue your skill exchange journey</p>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-bold text-white/40 uppercase tracking-wider ml-4 mb-2 block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-brand-purple/50 transition-colors"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-white/40 uppercase tracking-wider ml-4 mb-2 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-brand-purple/50 transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-tr from-brand-purple to-brand-cyan rounded-2xl font-bold text-lg glow-purple flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-brand-purple/30"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Sign In <ArrowRight className="w-5 h-5" /></>}
          </button>
        </form>

        <div className="my-8 flex items-center gap-4">
          <div className="flex-1 h-px bg-white/5" />
          <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Or continue with</span>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => handleSocialLogin(googleProvider)}
            className="glass py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all font-bold text-xs"
          >
            <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-3 h-3" alt="Google" />
            </div>
            Google
          </button>
          <button 
            onClick={() => handleSocialLogin(githubProvider)}
            className="glass py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all font-bold text-xs"
          >
            <Github className="w-5 h-5 text-white" />
            GitHub
          </button>
        </div>

        <p className="mt-8 text-center text-white/40 text-sm">
          Don't have an account? <Link to="/signup" className="text-brand-purple font-bold hover:underline">Create one</Link>
        </p>
      </motion.div>
    </div>
  );
}
