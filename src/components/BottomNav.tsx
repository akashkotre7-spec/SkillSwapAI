import { Link, useLocation } from "react-router-dom";
import { Sparkles, MessageCircle, Heart, User, Bell, Search, Stars } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../lib/utils.ts";

const navItems = [
  { path: "/discovery", icon: Search, label: "Discover" },
  { path: "/matches", icon: Heart, label: "Matches" },
  { path: "/chats", icon: MessageCircle, label: "Chats" },
  { path: "/coach", icon: Stars, label: "Coach" },
  { path: "/profile", icon: User, label: "Profile" },
];

export default function BottomNav() {
  const location = useLocation();

  if (["/", "/login", "/signup", "/onboarding"].includes(location.pathname)) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] px-6 pb-8 pointer-events-none">
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="max-w-md mx-auto glass rounded-[32px] p-2 flex items-center justify-between pointer-events-auto shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-white/5"
      >
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative flex-1 flex flex-col items-center justify-center py-2"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-brand-purple/10 rounded-2xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <item.icon 
                className={cn(
                  "w-5 h-5 transition-all duration-300",
                  isActive ? "text-brand-purple scale-110" : "text-white/40 hover:text-white/60"
                )} 
              />
              {isActive && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 w-1 h-1 bg-brand-purple rounded-full shadow-[0_0_10px_#8B5CF6]"
                />
              )}
            </Link>
          );
        })}
      </motion.div>
    </nav>
  );
}
