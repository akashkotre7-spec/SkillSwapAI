import { useState, useEffect } from "react";
import { db, handleFirestoreError, OperationType } from "../lib/firebase.ts";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { ArrowLeft, Camera, Settings, LogOut, Code, Palette, Brain, Zap, Loader2, Award, Star, Shield, Trophy, Plus, Stars, Heart, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useStore } from "../lib/store.ts";
import { useTranslation } from "../lib/i18n.ts";
import { uploadImage } from "../lib/upload.ts";
import { cn, getUserAvatar } from "../lib/utils.ts";
import { setStorageItem } from "../lib/storage.ts";
import LanguageSwitcher from "../components/LanguageSwitcher.tsx";

export default function Profile() {
  const { user, setUser } = useStore();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [updatingAvatar, setUpdatingAvatar] = useState(false);
  const [updatingCover, setUpdatingCover] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isEditingGender, setIsEditingGender] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<any | null>(null);
  const [bioDraft, setBioDraft] = useState("");
  const navigate = useNavigate();

  // Sync bio draft when user loads
  useEffect(() => {
    if (user?.bio) {
      setBioDraft(user.bio);
    }
  }, [user?.bio]);

  // Redirection logic
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [loading, user, navigate]);

  const calculateCompletion = () => {
    if (!user) return 0;
    const fields = ['avatar', 'bio', 'teaches', 'learns', 'gender', 'socials'];
    const filled = fields.filter(f => {
      const val = (user as any)[f];
      if (Array.isArray(val)) return val.length > 0;
      return !!val;
    });
    return Math.round((filled.length / fields.length) * 100);
  };

  const handleCoverUpdate = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setUpdatingCover(true);
      setError(null);
      const url = await uploadImage(file);
      const userRef = doc(db, "users", user.userId);
      await setDoc(userRef, { 
        coverImage: url,
        updatedAt: serverTimestamp()
      }, { merge: true });
      setUser({ ...user, coverImage: url });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Cover upload failed");
    } finally {
      setUpdatingCover(false);
    }
  };

  const handleAvatarUpdate = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.userId) return;

    try {
      setUpdatingAvatar(true);
      setError(null);
      console.log("[Profile] Starting avatar upload for user:", user.userId);
      const url = await uploadImage(file);
      console.log("[Profile] Upload successful, URL:", url);
      
      const userRef = doc(db, "users", user.userId);
      const updateData = { 
        avatar: url,
        updatedAt: serverTimestamp()
      };
      
      await setDoc(userRef, updateData, { merge: true });
      console.log("[Profile] Firestore updated with new avatar");
      
      // Update local state is handled by App.tsx listener, but we also update store for speed.
      setUser({ ...user, ...updateData });
    } catch (err: any) {
      console.error("[Profile] Avatar upload error:", err);
      setError(err.message || "Avatar upload failed. Check file size and format.");
    } finally {
      setUpdatingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user?.userId) return;
    try {
      setUpdatingAvatar(true);
      const userRef = doc(db, "users", user.userId);
      const updateData = { 
        avatar: "", // Clear the avatar field to enable fallback
        updatedAt: serverTimestamp()
      };
      await setDoc(userRef, updateData, { merge: true });
      setUser({ ...user, ...updateData });
      console.log("[Profile] Avatar removed, reverting to fallback");
    } catch (err) {
      console.error(err);
      setError("Failed to remove avatar");
    } finally {
      setUpdatingAvatar(false);
    }
  };

  // Remove duplicate initial fetch and standardize on App.tsx sync
  useEffect(() => {
    setLoading(false);
  }, []);

  const handleAddSkill = async (type: "teaches" | "learns") => {
    const skill = prompt(`Add a skill to ${type}:`);
    if (!skill || !user) return;

    try {
      const userRef = doc(db, "users", user.userId);
      const updatedList = [...(user[type] || []), skill];
      await setDoc(userRef, { 
        [type]: updatedList,
        updatedAt: serverTimestamp()
      }, { merge: true });
      setUser({ ...user, [type]: updatedList });
    } catch (err) {
      console.error(err);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.clear();
    navigate("/login");
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-brand-black">
      <Loader2 className="animate-spin text-brand-purple w-12 h-12" />
    </div>
  );

  if (!user) return null;

  const handleSaveBio = async () => {
    if (!user.userId) return;
    try {
      const userRef = doc(db, "users", user.userId);
      await setDoc(userRef, { 
        bio: bioDraft,
        updatedAt: serverTimestamp()
      }, { merge: true });
      setUser({ ...user, bio: bioDraft });
      setIsEditingBio(false);
      console.log("[Profile] Bio saved:", bioDraft);
    } catch (err) {
      console.error(err);
      setError("Failed to save bio");
    }
  };

  const handleUpdateGender = async (newGender: string) => {
    if (!user.userId) return;
    try {
      const userRef = doc(db, "users", user.userId);
      await setDoc(userRef, { 
        gender: newGender,
        updatedAt: serverTimestamp()
      }, { merge: true });
      setUser({ ...user, gender: newGender });
      setIsEditingGender(false);
      console.log("[Profile] Gender updated:", newGender);
    } catch (err) {
      console.error(err);
      setError("Failed to update gender");
    }
  };

  const ACHIEVEMENTS_DATA = [
    { 
      id: 'verified',
      icon: <Shield className="text-green-500" />, 
      label: "Verified", 
      title: "The Trust Signal",
      description: "You've successfully verified your skills and identity. This badge increases your match visibility by 40%.",
      rarity: "Uncommon",
      unlocked: true
    },
    { 
      id: 'top-rated',
      icon: <Star className="text-yellow-400" />, 
      label: "Top Rated", 
      title: "Rising Star",
      description: "Consistent 5-star ratings from your learning partners. You reflect excellence in peer-to-peer education.",
      rarity: "Rare",
      unlocked: true
    },
    { 
      id: 'guru',
      icon: <Trophy className="text-brand-purple" />, 
      label: "Guru Status", 
      title: "Knowledge Vessel",
      description: "You have taught over 50 sessions. Your expertise is the backbone of the community.",
      rarity: "Legendary",
      unlocked: true
    },
    { 
      id: 'ai-master',
      icon: <Brain className="text-brand-cyan" />, 
      label: "AI Master", 
      title: "Neural Explorer",
      description: "You've completed all AI Coach roadmaps. You are officially part of the 1% who mastered generative tools.",
      rarity: "Mythic",
      unlocked: true
    }
  ];

  return (
    <div className="min-h-screen bg-brand-black bg-mesh overflow-y-auto pb-32">
      <header className="relative h-72 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-purple to-brand-cyan opacity-40 animate-pulse-slow" />
        <div 
          className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-50 transition-all duration-700"
          style={{ backgroundImage: `url(${user.coverImage || user.avatar})` }}
        />
        
        <div className="absolute bottom-6 right-6 z-10">
          <label className="glass px-4 py-2 rounded-full flex items-center gap-2 cursor-pointer hover:bg-white/10 transition-all text-[10px] font-black uppercase tracking-widest">
            {updatingCover ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
            Edit Cover
            <input type="file" className="hidden" accept="image/*" onChange={handleCoverUpdate} />
          </label>
        </div>

        <div className="absolute inset-x-6 top-10 flex items-center justify-between z-10">
          <Link to="/discovery" className="w-12 h-12 glass rounded-full flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <div className="flex gap-4">
            <LanguageSwitcher />
            <Link 
              to="/settings"
              className="w-12 h-12 glass rounded-full flex items-center justify-center hover:bg-white/10 transition-all"
            >
              <Settings className="w-5 h-5" />
            </Link>
            <button onClick={logout} className="w-12 h-12 glass bg-red-500/10 border-red-500/20 rounded-full flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="px-6 -mt-16 relative z-10 max-w-4xl mx-auto">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
             {error}
          </div>
        )}
        <div className="glass-card rounded-[48px] p-10 pb-12 mb-10 shadow-2xl">
          <div className="flex flex-col items-center text-center -mt-28 mb-10">
            <div className="relative mb-8 group">
              <div 
                onClick={() => document.getElementById('avatar-input')?.click()}
                className="w-40 h-40 rounded-full border-[6px] border-brand-black p-1 glow-purple relative overflow-hidden bg-brand-black cursor-pointer hover:scale-105 transition-transform active:scale-95 group-active:scale-95"
              >
                {updatingAvatar ? (
                  <div className="w-full h-full flex items-center justify-center bg-brand-black/50 absolute inset-0 z-10">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-purple" />
                  </div>
                ) : null}
                <img 
                  key={getUserAvatar(user)} 
                  src={getUserAvatar(user)} 
                  className="w-full h-full rounded-full object-cover shadow-2xl transition-all duration-500" 
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (!target.src.includes("dicebear.com")) {
                      target.src = getFallbackAvatar(user.name, user.gender);
                    }
                  }}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center flex-col gap-2">
                  <Camera className="w-8 h-8 text-white" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">Change Photo</span>
                </div>
                {user.avatar && !user.avatar.includes("dicebear.com") && (
                   <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveAvatar();
                    }}
                    className="absolute top-0 right-0 w-8 h-8 bg-black/80 text-white rounded-full flex items-center justify-center border border-white/20 hover:bg-red-500 transition-all z-20"
                    title="Remove Photo"
                   >
                     <Plus className="w-4 h-4 rotate-45" />
                   </button>
                )}
              </div>
              <label className="absolute bottom-1 right-2 w-12 h-12 bg-white text-brand-black rounded-full flex items-center justify-center border-4 border-brand-black shadow-lg cursor-pointer hover:scale-110 active:scale-95 transition-all">
                <Camera className="w-5 h-5" />
                <input id="avatar-input" type="file" className="hidden" accept="image/*" onChange={handleAvatarUpdate} />
              </label>
            </div>
            
            <h1 className="text-4xl font-bold mb-2 tracking-tight">{user.name}</h1>
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 bg-brand-purple/20 text-brand-purple text-[10px] uppercase font-black tracking-widest rounded-full border border-brand-purple/20">
                Level {user.level || 8}
              </span>
              <span className="text-white/20 font-black tracking-widest">•</span>
              <span className="text-[10px] text-white/40 uppercase font-black tracking-widest flex items-center gap-1">
                <Zap className="w-3 h-3 text-yellow-400" /> {user.points || 1240} XP
              </span>
            </div>

            <div className="w-full max-w-xs h-2 bg-white/5 rounded-full overflow-hidden mb-1 relative">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${calculateCompletion()}%` }}
                 className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand-purple to-brand-cyan rounded-full glow-purpleShadow"
               />
            </div>
            <p className="text-[10px] text-white/20 uppercase font-black tracking-widest mb-10">
              Profile {calculateCompletion()}% Complete
            </p>
            
            <AnimatePresence mode="wait">
              {isEditingBio ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="w-full max-w-lg mb-6"
                >
                  <textarea
                    value={bioDraft}
                    onChange={(e) => setBioDraft(e.target.value)}
                    className="w-full bg-white/5 border border-brand-purple/30 rounded-3xl p-6 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/50 transition-all min-h-[120px] resize-none"
                    placeholder="Tell your story..."
                  />
                  <div className="flex justify-end gap-3 mt-4">
                    <button 
                      onClick={() => setIsEditingBio(false)}
                      className="px-6 py-2 glass rounded-full text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSaveBio}
                      className="px-6 py-2 bg-brand-purple rounded-full text-[10px] font-black uppercase tracking-widest text-white glow-purple transition-all hover:scale-105 active:scale-95"
                    >
                      Save Bio
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-white/60 max-w-lg mb-4 leading-relaxed italic text-lg"
                >
                  "{user.bio || "Crafting digital experiences and learning how to build the next generation of AI-native applications."}"
                </motion.p>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-4 mb-10">
              {!isEditingBio && (
                <button 
                  onClick={() => {
                    setBioDraft(user.bio || "");
                    setIsEditingBio(true);
                  }}
                  className="text-[10px] font-black uppercase tracking-widest text-brand-purple hover:underline"
                >
                  Edit Bio
                </button>
              )}
              <div className="w-1 h-1 bg-white/10 rounded-full" />
              <div className="relative">
                {isEditingGender ? (
                  <div className="flex flex-wrap justify-center gap-2">
                    {["male", "female", "non-binary", "other"].map((g) => (
                      <button
                        key={g}
                        onClick={() => handleUpdateGender(g)}
                        className={cn(
                          "text-[9px] px-3 py-2 rounded-xl uppercase font-black tracking-widest border transition-all",
                          user.gender === g ? "bg-brand-purple border-brand-purple text-white glow-purple" : "bg-white/5 border-white/10 hover:border-white/20 text-white/60"
                        )}
                      >
                        {g}
                      </button>
                    ))}
                    <button onClick={() => setIsEditingGender(false)} className="text-[9px] text-white/40 border border-white/5 hover:border-white/20 px-3 py-2 rounded-xl uppercase font-black ml-2">Cancel</button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsEditingGender(true)}
                    className="text-[10px] text-white/40 uppercase font-black tracking-widest hover:text-brand-purple transition-colors"
                  >
                    Gender: {user.gender || "Other"}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-12">
             <div className="glass p-6 rounded-[32px] text-center border-white/5 hover:border-brand-purple/20 transition-all group">
                <Heart className="w-5 h-5 text-brand-purple mx-auto mb-2 opacity-50 group-hover:opacity-100 transition-opacity" />
                <p className="text-3xl font-black text-white">24</p>
                <p className="text-[10px] uppercase font-black text-white/30 tracking-[0.2em] mt-2">Matches</p>
             </div>
             <div className="glass p-6 rounded-[32px] text-center border-brand-glow/20 bg-brand-glow/5 group">
                <Zap className="w-5 h-5 text-brand-glow mx-auto mb-2 opacity-50 group-hover:opacity-100 transition-opacity animate-pulse" />
                <p className="text-3xl font-black text-white">{user.xp || 1240}</p>
                <p className="text-[10px] uppercase font-black text-white/30 tracking-[0.2em] mt-2">XP Points</p>
             </div>
             <div className="glass p-6 rounded-[32px] text-center border-white/5 hover:border-brand-purple/20 transition-all group">
                <Trophy className="w-5 h-5 text-yellow-400 mx-auto mb-2 opacity-50 group-hover:opacity-100 transition-opacity" />
                <p className="text-3xl font-black text-white">{user.level || 8}</p>
                <p className="text-[10px] uppercase font-black text-white/30 tracking-[0.2em] mt-2">Level</p>
             </div>
          </div>

          {/* New Dashboard Widgets */}
          <div className="space-y-8 mb-12">
            <div className="glass-card rounded-[32px] p-8 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                 <Stars className="w-20 h-20 text-brand-purple" />
               </div>
               <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                 <Sparkles className="w-5 h-5 text-brand-purple" />
                 Learning Streak
               </h3>
               <div className="flex items-center gap-6">
                  <div className="flex -space-x-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className={cn("w-12 h-12 rounded-2xl border-4 border-brand-black flex items-center justify-center font-black text-xs", i < 3 ? "bg-brand-purple shadow-[0_0_15px_#8B5CF6]" : "bg-white/5 text-white/20")}>
                        {i + 1}
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-sm font-bold">3 Day Streak!</p>
                    <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">Mastery in progress</p>
                  </div>
               </div>
            </div>
          </div>

          <div className="space-y-12">
            <section>
              <div className="flex items-center justify-between mb-6">
                 <h4 className="text-xs font-black text-white/30 uppercase tracking-[0.3em] flex items-center gap-2">
                   <Award className="w-4 h-4 text-brand-purple" /> Achievements
                 </h4>
                 <span className="text-[10px] font-bold text-brand-cyan">4 / 12 Unlocked</span>
              </div>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                 {ACHIEVEMENTS_DATA.map((badge, i) => (
                    <motion.div 
                      key={i}
                      whileHover={{ y: -5 }}
                      onClick={() => setSelectedAchievement(badge)}
                      className="flex-shrink-0 w-28 aspect-square glass flex flex-col items-center justify-center rounded-[32px] border-white/5 hover:border-brand-purple/30 transition-all p-3 cursor-help mb-2"
                    >
                       <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-3">
                          {badge.icon}
                       </div>
                       <span className="text-[8px] font-black uppercase tracking-widest text-white/40 text-center">{badge.label}</span>
                    </motion.div>
                 ))}
                 <div className="flex-shrink-0 w-28 aspect-square glass border-dashed border-white/5 flex flex-col items-center justify-center rounded-[32px] opacity-20 mb-2">
                    <Trophy className="w-10 h-10 mb-2" />
                    <span className="text-[8px] font-black">LOCKED</span>
                 </div>
              </div>
            </section>

            <section>
              <h4 className="text-xs font-black text-white/30 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                <Code className="w-4 h-4" /> Teaching
              </h4>
              <div className="flex flex-wrap gap-3">
                {user.teaches?.map((s: string) => (
                  <motion.span key={s} whileHover={{ scale: 1.05 }} className="px-6 py-3 glass rounded-2xl text-sm font-bold border-brand-purple/20 text-white/80">
                    {s}
                  </motion.span>
                ))}
                <button 
                  onClick={() => handleAddSkill("teaches")}
                  className="px-6 py-3 border-2 border-dashed border-white/10 rounded-2xl text-[10px] text-white/30 hover:border-brand-purple/50 transition-colors uppercase font-black tracking-widest flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Skill
                </button>
              </div>
            </section>

            <section>
              <h4 className="text-xs font-bold text-white/30 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <Palette className="w-4 h-4" /> Learning
              </h4>
              <div className="flex flex-wrap gap-3">
                {user.learns?.map((s: string) => (
                  <motion.span key={s} whileHover={{ scale: 1.05 }} className="px-6 py-3 glass bg-white/5 rounded-2xl text-sm font-bold">
                    {s}
                  </motion.span>
                ))}
                <button 
                  onClick={() => handleAddSkill("learns")}
                  className="px-6 py-3 border-2 border-dashed border-white/10 rounded-2xl text-[10px] text-white/30 hover:border-brand-purple/50 transition-colors uppercase font-black tracking-widest flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Goal
                </button>
              </div>
            </section>
          </div>
        </div>

        <section className="glass p-8 rounded-[40px] mb-12 border border-brand-purple/20 relative overflow-hidden group">
           <div className="absolute inset-0 bg-brand-purple/5 opacity-0 group-hover:opacity-100 transition-opacity" />
           <div className="flex items-center justify-between mb-6 relative z-10">
              <h4 className="text-lg font-bold">AI Learning Coach</h4>
              <Brain className="text-brand-purple w-7 h-7" />
           </div>
           <p className="text-sm text-white/50 leading-relaxed italic mb-8 relative z-10">
             Get personalized roadmaps and 24/7 tutoring from Gemini to accelerate your skill acquisition.
           </p>
           <Link to="/coach" className="relative z-10 block w-full py-4 bg-brand-purple rounded-2xl font-bold text-center glow-purple hover:scale-[1.02] transition-all">
             Open Learning Studio
           </Link>
        </section>

        <section className="glass p-8 rounded-[40px] mb-12">
           <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-bold">AI Insight</h4>
              <Brain className="text-brand-purple w-6 h-6" />
           </div>
           <p className="text-sm text-white/50 leading-relaxed italic">
             "Your profile is highly complementary to Design systems specialists. Based on your current teaching set, you have an 88% higher match probability with Creative Directors over the last 30 days."
           </p>
        </section>
      </main>

      {/* Achievement Details Modal */}
      <AnimatePresence>
        {selectedAchievement && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-brand-black/90 backdrop-blur-xl"
            onClick={() => setSelectedAchievement(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-card w-full max-w-sm p-8 rounded-[48px] text-center relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-brand-purple to-transparent" />
              
              <div className="w-24 h-24 bg-white/5 rounded-[32px] flex items-center justify-center mx-auto mb-6 glow-purple border border-white/10">
                {selectedAchievement.icon}
              </div>

              <span className="inline-block px-3 py-1 bg-brand-purple/20 text-brand-purple text-[8px] font-black uppercase tracking-[0.2em] rounded-full mb-4 border border-brand-purple/20">
                {selectedAchievement.rarity} Achievement
              </span>

              <h2 className="text-2xl font-black mb-2">{selectedAchievement.title}</h2>
              <p className="text-white/60 text-sm leading-relaxed mb-8">
                {selectedAchievement.description}
              </p>

              <button 
                onClick={() => setSelectedAchievement(null)}
                className="w-full py-4 bg-brand-purple hover:bg-brand-purple/80 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
              >
                Close Details
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
