import { useState } from "react";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Bell, Shield, Moon, Globe, LogOut, ChevronRight, Camera, Trash2 } from "lucide-react";
import { useStore } from "../lib/store.ts";
import { auth, db } from "../lib/firebase.ts";
import { doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { signOut, deleteUser } from "firebase/auth";
import { useTranslation } from "../lib/i18n.ts";
import { uploadImage } from "../lib/upload.ts";
import { cn, getUserAvatar } from "../lib/utils.ts";

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
  { code: "kn", name: "Kannada", flag: "🇮🇳" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "fr", name: "French", flag: "🇫🇷" },
];

export default function Settings() {
  const { user, setUser, language, setLanguage } = useStore();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    navigate("/");
  };

  const handleDeleteAccount = async () => {
    if (confirm("Are you sure you want to delete your account? This is irreversible.")) {
      try {
        if (!user || !auth.currentUser) return;
        await deleteDoc(doc(db, "users", user.userId));
        await deleteUser(auth.currentUser);
        setUser(null);
        navigate("/");
      } catch (err: any) {
        alert("Please login again to delete your account for security reasons.");
      }
    }
  };

  const updateSettings = async (updates: any) => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.userId);
      const newSettings = { ...(user.settings || { darkMode: true, notifications: true, language: language }), ...updates };
      await setDoc(userRef, { 
        settings: newSettings,
        updatedAt: serverTimestamp()
      }, { merge: true });
      // setUser should happen automatically via listener in App.tsx
    } catch (err) {
      console.error(err);
    }
  };

  const handleAvatarUpdate = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    setError(null);
    try {
      const url = await uploadImage(file);
      const userRef = doc(db, "users", user.userId);
      await setDoc(userRef, { 
        avatar: url,
        updatedAt: serverTimestamp()
      }, { merge: true });
      setUser({ ...user, avatar: url });
      console.log("[Settings] Avatar updated:", url);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-black pb-24">
      {/* Header */}
      <div className="glass p-6 sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/profile" className="w-10 h-10 glass rounded-full flex items-center justify-center">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold">{t("settings")}</h1>
        </div>
      </div>

      <div className="p-6 max-w-2xl mx-auto space-y-8">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
             {error}
          </div>
        )}
        {/* Profile Card */}
        <div className="glass-card rounded-[32px] p-8 flex items-center gap-6">
          <div className="relative group">
            <img 
              key={getUserAvatar(user)}
              src={getUserAvatar(user)} 
              className="w-24 h-24 rounded-full object-cover border-4 border-brand-purple transition-all duration-500" 
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.src.includes("dicebear.com")) {
                  target.src = getFallbackAvatar(user?.name || "User", user?.gender);
                }
              }}
            />
            <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              {uploading ? <div className="w-6 h-6 border-2 border-white border-t-transparent animate-spin rounded-full" /> : <Camera className="w-6 h-6 text-white" />}
              <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpdate} />
            </label>
          </div>
          <div>
            <h2 className="text-2xl font-bold">{user?.name}</h2>
            <p className="text-white/40">{user?.email}</p>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          <SectionTitle title="Account" />
          <SettingsItem 
            icon={<User className="w-5 h-5 text-brand-purple" />} 
            title="Edit Profile" 
            onClick={() => navigate("/onboarding")}
          />
          <SettingsItem 
            icon={<Shield className="w-5 h-5 text-brand-cyan" />} 
            title="Privacy & Security" 
          />
          
          <SectionTitle title="Preferences" />
          <div className="glass-card rounded-3xl p-4 space-y-2">
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-amber-500" />
                </div>
                <span className="font-medium">Language</span>
              </div>
              <select 
                value={user?.settings?.language || language}
                onChange={(e) => {
                  setLanguage(e.target.value);
                  updateSettings({ language: e.target.value });
                }}
                className="bg-transparent text-sm font-bold focus:outline-none cursor-pointer"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code} className="bg-brand-black">{lang.name}</option>
                ))}
              </select>
            </div>
            <div className="h-px bg-white/5 mx-3" />
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <Moon className="w-5 h-5 text-blue-400" />
                </div>
                <span className="font-medium">Dark Mode</span>
              </div>
              <button 
                onClick={() => updateSettings({ darkMode: !user?.settings?.darkMode })}
                className={cn(
                  "w-12 h-6 rounded-full relative transition-colors duration-200",
                  user?.settings?.darkMode !== false ? "bg-brand-purple" : "bg-white/10"
                )}
              >
                <motion.div 
                  animate={{ x: user?.settings?.darkMode !== false ? 24 : 4 }}
                  className="absolute top-1 w-4 h-4 bg-white rounded-full transition-all" 
                />
              </button>
            </div>
            <div className="h-px bg-white/5 mx-3" />
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-pink-500" />
                </div>
                <span className="font-medium">Notifications</span>
              </div>
              <button 
                onClick={() => updateSettings({ notifications: !user?.settings?.notifications })}
                className={cn(
                  "w-12 h-6 rounded-full relative transition-colors duration-200",
                  user?.settings?.notifications !== false ? "bg-brand-purple" : "bg-white/10"
                )}
              >
                <motion.div 
                  animate={{ x: user?.settings?.notifications !== false ? 24 : 4 }}
                  className="absolute top-1 w-4 h-4 bg-white rounded-full transition-all" 
                />
              </button>
            </div>
          </div>
          
          <div className="pt-8 space-y-4">
            <button 
              onClick={handleLogout}
              className="w-full glass p-5 rounded-3xl flex items-center justify-center gap-2 text-white font-bold hover:bg-white/5 transition-all"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
            <button 
              onClick={handleDeleteAccount}
              className="w-full p-5 rounded-3xl flex items-center justify-center gap-2 text-red-500 font-bold hover:bg-red-500/10 transition-all border border-red-500/20"
            >
              <Trash2 className="w-5 h-5" />
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <h3 className="text-xs font-black uppercase tracking-widest text-white/40 ml-4 mb-2">{title}</h3>;
}

function SettingsItem({ icon, title, onClick }: { icon: any, title: string, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="w-full glass-card rounded-3xl p-4 flex items-center justify-between hover:bg-white/10 transition-all group"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
          {icon}
        </div>
        <span className="font-medium">{title}</span>
      </div>
      <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white transition-colors" />
    </button>
  );
}
