import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { db, auth, handleFirestoreError, OperationType } from "../lib/firebase.ts";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { 
  Sparkles, Code, Palette, Brain, Zap, 
  ArrowRight, CheckCircle2, User, Camera, 
  Lightbulb, Rocket, Stars, Heart, Loader2
} from "lucide-react";
import { useStore } from "../lib/store.ts";
import { askGemini } from "../lib/gemini.ts";
import { cn, getUserAvatar } from "../lib/utils.ts";
import { getStorageItem, setStorageItem } from "../lib/storage.ts";
import { uploadImage } from "../lib/upload.ts";

const steps = [
  {
    id: "teaches",
    title: "What can you teach?",
    subtitle: "Select up to 3 skills you excel at",
    icon: Rocket,
    options: ["React", "TypeScript", "UI Design", "Figma", "Branding", "Node.js", "Python", "Marketing", "Piano", "Spanish", "Photography", "SEO"],
    multi: true
  },
  {
    id: "learns",
    title: "What do you want to learn?",
    subtitle: "Choose your next obsession",
    icon: Lightbulb,
    options: ["Game Design", "Swift", "Martial Arts", "Cooking", "Video Editing", "Public Speaking", "Data Science", "Illustration", "French", "Philosophy", "Scaling SaaS", "Web3"],
    multi: true
  },
  {
    id: "gender",
    title: "How do you identify?",
    subtitle: "Help us build a safe ecosystem",
    icon: User,
    options: ["male", "female", "non-binary", "prefer not to say", "custom"],
    multi: false
  },
  {
    id: "preferredGender",
    title: "Who do you want to learn with?",
    subtitle: "Set your community preference",
    icon: Heart,
    options: ["male", "female", "non-binary", "other", "any"],
    multi: false
  },
  {
    id: "avatar",
    title: "Your identity",
    subtitle: "A picture is worth a thousand sessions",
    icon: User,
    isAvatar: true
  },
  {
    id: "processing",
    title: "AI Analysis",
    subtitle: "Synthesizing your talent profile",
    icon: Stars,
    isProcessing: true
  }
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const { user, setUser } = useStore();
  const [selections, setSelections] = useState<any>({
    teaches: user?.teaches || [],
    learns: user?.learns || [],
    gender: user?.gender || "other",
    preferredGender: user?.preferredGender || "any",
    avatar: user?.avatar || ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Sync selections if user is loaded later
  useEffect(() => {
    if (user && selections.teaches.length === 0 && user.teaches?.length > 0) {
      setSelections({
        teaches: user.teaches || [],
        learns: user.learns || [],
        gender: user.gender || "other",
        preferredGender: user.preferredGender || "any",
        avatar: user.avatar || ""
      });
    }
  }, [user?.userId]);

  const handleSelect = async (option: string) => {
    setError(null);
    const step = steps[currentStep];
    const key = step.id as keyof typeof selections;
    const current = selections[key];
    
    let newSelections = { ...selections };

    if (step.multi) {
      const currentList = (current || []) as string[];
      if (currentList.includes(option)) {
        newSelections[key] = currentList.filter(o => o !== option);
      } else if (currentList.length < 3) {
        newSelections[key] = [...currentList, option];
      }
    } else {
      newSelections[key] = option;
    }
    
    setSelections(newSelections);

    // Save every state change to Firestore for persistence
    if (!step.isProcessing && user?.userId) {
      try {
        const userRef = doc(db, "users", user.userId);
        await updateDoc(userRef, {
          [key]: newSelections[key],
          updatedAt: serverTimestamp()
        });
        console.log(`[Onboarding] Saved ${String(key)}:`, newSelections[key]);
      } catch (err) {
        console.error(`[Onboarding] Save failed for ${String(key)}`, err);
      }
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.userId) return;

    setLoading(true);
    setError(null);
    try {
      console.log("[Onboarding] Uploading avatar...");
      const url = await uploadImage(file);
      setSelections((prev: any) => ({ ...prev, avatar: url }));
      
      const userRef = doc(db, "users", user.userId);
      await updateDoc(userRef, {
        avatar: url,
        updatedAt: serverTimestamp()
      });
      console.log(`[Onboarding] Avatar saved: ${url}`);
    } catch (err: any) {
      setError(err.message || "Upload failed");
      console.error("[Onboarding] Avatar update error:", err);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  useEffect(() => {
    if (steps[currentStep].isProcessing) {
      processAIProfile();
    }
  }, [currentStep]);

  const processAIProfile = async () => {
    try {
      if (!user) return;
      
      const teaches = Array.isArray(selections.teaches) ? selections.teaches : [];
      const learns = Array.isArray(selections.learns) ? selections.learns : [];
      
      const prompt = `Based on a user who teaches ${teaches.join(", ")} and wants to learn ${learns.join(", ")}, write a 1-sentence catchy professional bio that highlights their unique value. Be concise and startup-y.`;
      
      const bio = await askGemini(prompt);
      
      const userRef = doc(db, "users", user.userId);
      const updateData = {
        teaches: teaches,
        learns: learns,
        gender: selections.gender || "other",
        preferredGender: selections.preferredGender || "any",
        bio: bio,
        // Only save avatar if it's explicitly uploaded (not empty)
        avatar: selections.avatar || "",
        onboarded: true,
        points: 200, // Bonus for completion
        updatedAt: serverTimestamp()
      };

      await updateDoc(userRef, updateData);
      
      const updatedUser = { ...user, ...updateData };
      setUser(updatedUser);
      setStorageItem("user", updatedUser);

      setTimeout(() => {
        navigate("/discovery");
      }, 3000);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, "users");
    }
  };

  const step = steps[currentStep];

  return (
    <div className="min-h-screen bg-brand-black flex flex-col items-center justify-center p-6 lg:p-12 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-purple/10 rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-glow/10 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '-2s' }} />
      </div>

      <motion.div 
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="w-full max-w-xl glass-card rounded-[48px] p-8 lg:p-12 z-10 relative overflow-hidden"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center">
            <step.icon className="w-6 h-6 text-brand-purple" />
          </div>
          <div>
            <h2 className="text-2xl font-black">{step.title}</h2>
            <p className="text-white/40 text-sm">{step.subtitle}</p>
          </div>
        </div>

        {step.options && (
          <div className="grid grid-cols-2 gap-3 mb-10">
            {step.options.map((option) => (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                className={cn(
                  "py-4 px-6 rounded-2xl transition-all duration-300 font-bold text-xs border",
                  (step.multi 
                    ? (Array.isArray(selections[step.id]) && selections[step.id].includes(option))
                    : selections[step.id] === option)
                    ? "bg-brand-purple border-brand-purple shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                    : "glass border-white/5 hover:border-white/20"
                )}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {step.isAvatar && (
          <div className="flex flex-col items-center py-10">
            <div className="relative group">
              <div className="w-32 h-32 rounded-[40px] bg-white/5 border-2 border-brand-purple/20 flex items-center justify-center overflow-hidden transition-all duration-500 group-hover:scale-105 group-hover:border-brand-purple">
                {selections.avatar ? (
                  <img src={selections.avatar} className="w-full h-full object-cover" />
                ) : (
                  <img src={getUserAvatar({ name: user?.name || "Guest", gender: selections.gender })} className="w-full h-full object-cover opacity-50" />
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-brand-purple rounded-2xl flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-all">
                {loading ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Camera className="w-5 h-5 text-white" />}
                <input 
                  type="file" 
                  accept="image/*"
                  className="hidden" 
                  onChange={handleAvatarUpload}
                />
              </label>
            </div>
            {error && (
              <p className="mt-4 text-red-500 text-xs font-bold bg-red-500/10 px-4 py-2 rounded-xl">
                {error}
              </p>
            )}
            <p className="mt-6 text-white/40 text-[10px] uppercase font-black tracking-widest text-center max-w-[200px]">
              Tip: Paste an image URL or use our AI defaults
            </p>
          </div>
        )}

        {step.isProcessing && (
          <div className="py-20 flex flex-col items-center">
            <div className="relative w-24 h-24">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-t-2 border-brand-purple rounded-full"
              />
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                className="absolute inset-4 border-t-2 border-brand-glow rounded-full"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white animate-pulse" />
              </div>
            </div>
            <div className="mt-12 space-y-3 text-center">
              <motion.p 
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-sm font-bold text-brand-purple"
              >
                Generating AI Identity...
              </motion.p>
              <p className="text-[10px] text-white/20 uppercase font-black tracking-widest">Searching for compatible mentors</p>
            </div>
          </div>
        )}

        {!step.isProcessing && (
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {steps.filter(s => !s.isProcessing).map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "w-8 h-1 rounded-full transition-all duration-500",
                    i === currentStep ? "bg-brand-purple w-12" : i < currentStep ? "bg-brand-purple/40" : "bg-white/10"
                  )} 
                />
              ))}
            </div>
            <button
              onClick={nextStep}
              className="px-8 py-4 bg-brand-purple rounded-2xl flex items-center gap-3 font-bold hover:scale-105 active:scale-95 transition-all shadow-[0_10px_20px_rgba(139,92,246,0.3)] disabled:opacity-50"
            >
              <span>{currentStep === steps.length - 2 ? "Finish" : "Continue"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
