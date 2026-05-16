import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  coverImage?: string;
  teaches: string[];
  learns: string[];
  points: number;
  xp: number;
  level: number;
  role: "user" | "moderator" | "admin";
  bio?: string;
  gender?: string;
  preferredGender?: string;
  onboarded: boolean;
  settings?: {
    darkMode: boolean;
    notifications: boolean;
    language: string;
  };
  location?: string;
  socials?: {
    github?: string;
    twitter?: string;
    linkedin?: string;
  };
  badges?: string[];
  createdAt: any;
}

interface Notification {
  id: string;
  type: "match" | "message" | "recommendation" | "system";
  title: string;
  message: string;
  read: boolean;
  timestamp: any;
  link?: string;
}

interface AppState {
  user: User | null;
  notifications: Notification[];
  activeMatches: any[];
  language: string;
  setUser: (user: User | null) => void;
  setLanguage: (lang: string) => void;
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  setActiveMatches: (matches: any[]) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      notifications: [],
      activeMatches: [],
      language: "en",
      setUser: (user) => set({ user }),
      setLanguage: (language) => set({ language }),
      setNotifications: (notifications) => set({ notifications }),
      addNotification: (notification) => set((state) => ({ 
        notifications: [notification, ...state.notifications] 
      })),
      markNotificationRead: (id) => set((state) => ({
        notifications: state.notifications.map((n) => 
          n.id === id ? { ...n, read: true } : n
        )
      })),
      clearNotifications: () => set({ notifications: [] }),
      setActiveMatches: (activeMatches) => set({ activeMatches }),
    }),
    {
      name: "skill-swap-storage",
      partialize: (state) => ({ user: state.user }),
    }
  )
);
