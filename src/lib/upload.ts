import { storage, auth } from "./firebase.ts";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

/**
 * Upload utility using Firebase Storage with validation.
 */
export async function uploadImage(file: File): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("You must be logged in to upload images");
  }

  // Basic validation
  if (!file.type.startsWith("image/")) {
    throw new Error("File must be an image");
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error("Image must be smaller than 5MB");
  }

  try {
    const timestamp = Date.now();
    const filePath = `profile-images/${user.uid}/${timestamp}_${file.name}`;
    console.log("[Upload] Starting upload for:", filePath, file.type, file.size);
    
    const storageRef = ref(storage, filePath);
    const snapshot = await uploadBytes(storageRef, file);
    console.log("[Upload] UploadBytes completed");
    
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log("[Upload] Download URL obtained:", downloadURL);
    return downloadURL;
  } catch (error: any) {
    console.error("Firebase Storage upload error:", error);
    if (error.code === 'storage/unauthorized') {
      throw new Error("Upload failed: Permission denied. Please ensure your storage rules allow this path.");
    }
    throw error;
  }
}
