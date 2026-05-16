import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shield, X } from "lucide-react";
import { Link } from "react-router-dom";

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      const timer = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookie-consent", "true");
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-6 right-6 lg:left-auto lg:right-6 lg:w-96 z-[200]"
        >
          <div className="glass p-6 rounded-[32px] border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <button onClick={() => setShow(false)} className="text-white/20 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-brand-purple/20 rounded-2xl flex items-center justify-center shrink-0">
                <Shield className="w-6 h-6 text-brand-purple" />
              </div>
              <div>
                <h4 className="font-bold text-sm mb-1">Privacy Choice</h4>
                <p className="text-[10px] text-white/50 leading-relaxed">
                  We use cookies to improve your immersive exchange experience. By clicking "Accept", you agree to our <Link to="/privacy" className="text-brand-purple underline">Privacy Policy</Link>.
                </p>
                <div className="flex gap-3 mt-4">
                  <button 
                    onClick={accept}
                    className="px-6 py-2 bg-brand-purple rounded-xl text-[10px] font-bold hover:scale-105 active:scale-95 transition-all"
                  >
                    Accept
                  </button>
                  <button 
                    onClick={() => setShow(false)}
                    className="px-6 py-2 glass rounded-xl text-[10px] font-bold hover:bg-white/5 transition-all"
                  >
                    Manage
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
