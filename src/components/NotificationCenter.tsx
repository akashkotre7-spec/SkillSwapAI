import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bell, X, Check, MessageSquare, Heart, Sparkles, AlertCircle } from "lucide-react";
import { useStore } from "../lib/store.ts";
import { cn } from "../lib/utils.ts";
import { formatDistanceToNow } from "date-fns";

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, markNotificationRead, clearNotifications } = useStore();
  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case "match": return <Heart className="w-4 h-4 text-brand-purple" />;
      case "message": return <MessageSquare className="w-4 h-4 text-brand-cyan" />;
      case "recommendation": return <Sparkles className="w-4 h-4 text-yellow-400" />;
      default: return <AlertCircle className="w-4 h-4 text-white/40" />;
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 glass rounded-full flex items-center justify-center relative hover:bg-white/10 transition-all"
      >
        <Bell className="w-5 h-5 text-white/50" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-purple text-white text-[10px] font-black flex items-center justify-center rounded-full animate-pulse shadow-lg shadow-brand-purple/50">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-4 w-[320px] sm:w-[400px] glass p-2 rounded-[32px] border border-white/10 z-50 shadow-2xl overflow-hidden"
            >
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <h3 className="font-bold text-sm uppercase tracking-widest text-white/40">Notifications</h3>
                <button 
                  onClick={clearNotifications}
                  className="text-[10px] uppercase font-black text-brand-cyan hover:text-white transition-colors"
                >
                  Clear All
                </button>
              </div>

              <div className="max-h-[400px] overflow-y-auto no-scrollbar py-2">
                {notifications.length === 0 ? (
                  <div className="py-12 text-center">
                    <Bell className="w-8 h-8 text-white/10 mx-auto mb-3" />
                    <p className="text-xs text-white/30 italic">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={cn(
                        "p-4 rounded-2xl mb-1 flex gap-4 transition-all hover:bg-white/5 cursor-pointer group relative",
                        !n.read && "bg-brand-purple/5 border border-brand-purple/10"
                      )}
                    >
                      <div className="w-10 h-10 rounded-xl glass flex items-center justify-center flex-shrink-0">
                        {getIcon(n.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <h4 className="font-bold text-sm truncate pr-4">{n.title}</h4>
                          <span className="text-[10px] text-white/20 font-mono">
                            {formatDistanceToNow(n.timestamp, { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-xs text-white/50 leading-relaxed truncate">{n.message}</p>
                      </div>
                      {!n.read && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-brand-purple rounded-full" />
                      )}
                    </div>
                  ))
                )}
              </div>

              <button className="w-full py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-white/20 hover:text-white/40 transition-colors border-t border-white/5">
                View All Activity
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
