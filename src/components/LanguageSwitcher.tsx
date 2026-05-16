import { useState } from "react";
import { Globe, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils.ts";
import { useStore } from "../lib/store.ts";

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "hi", name: "हिन्दी", flag: "🇮🇳" }
];

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const { language: langCode, setLanguage } = useStore();
  const currentLang = languages.find(l => l.code === langCode) || languages[0];

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 glass rounded-full flex items-center justify-center hover:bg-white/10 transition-all text-sm"
      >
        {currentLang.flag}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[100] bg-black/10 lg:hidden"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute right-0 top-12 mt-2 w-48 glass p-2 rounded-2xl border border-white/10 z-[110] shadow-2xl"
            >
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full px-4 py-3 rounded-xl flex items-center justify-between text-xs font-bold transition-all",
                    currentLang.code === lang.code ? "bg-brand-purple text-white" : "hover:bg-white/5 text-white/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </div>
                  {currentLang.code === lang.code && <Check className="w-3 h-3" />}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
