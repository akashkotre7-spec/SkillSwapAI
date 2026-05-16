import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFallbackAvatar(name: string, gender?: string) {
  const cleanName = name?.trim() || "User";
  const seed = encodeURIComponent(cleanName);
  const g = gender?.toLowerCase() || "other";
  
  const isMale = g === "male" || g === "man" || g === "boy";
  const isFemale = g === "female" || g === "woman" || g === "girl";

  // DiceBear 7.x avataaars options - Using single values to ensure compatibility
  // Pick a trait based on seed for variety but locked to gender
  const maleTops = ["theCaesar", "theCaesarSidePart", "shortCurly", "dreads01", "frizzle", "shaggy", "sides"];
  const femaleTops = ["longHair", "straight", "bigHair", "curvy", "bob", "bun", "miaWallace", "straight2"];
  
  const charCode = (cleanName.charCodeAt(0) || 0) + cleanName.length;
  const top = isMale 
    ? maleTops[charCode % maleTops.length] 
    : (isFemale ? femaleTops[charCode % femaleTops.length] : "shortRound");
  
  let modifiers = `&top=${top}`;
  
  if (isMale) {
    modifiers += "&facialHairProbability=100&facialHair=beardLight,beardMedium";
  } else if (isFemale) {
    modifiers += "&facialHairProbability=0&mouth=smile,tongue";
  }

  // Use a cleaner seed and ensure it fluctuates with gender
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${g}-${seed}${modifiers}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
}

export function getUserAvatar(user: any) {
  // Priority: 1. Real uploaded avatar, 2. Google photoURL (real), 3. Gender-based fallback
  const avatar = user?.avatar || "";
  const photoURL = user?.photoURL || "";

  if (avatar && !avatar.includes("dicebear.com")) return avatar;
  if (photoURL && !photoURL.includes("dicebear.com") && !photoURL.includes("gravatar.com")) return photoURL;
  
  return getFallbackAvatar(user?.name || "User", user?.gender);
}
