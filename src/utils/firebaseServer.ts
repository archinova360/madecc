import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import fs from "fs";
import path from "path";

// Hardcoded fallback config from firebase-applet-config.json to prevent compile/load failures
const FALLBACK_CONFIG = {
  projectId: "gen-lang-client-0590188373",
  appId: "1:314883662102:web:84212a1c2acc8747a7f037",
  apiKey: "AIzaSyBss9EGyd-IUCvB-VMSWaHjnaW6l-Rl1YU",
  authDomain: "gen-lang-client-0590188373.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-dcd63177-61aa-4fbc-b32d-0e0d3053fd90",
  storageBucket: "gen-lang-client-0590188373.firebasestorage.app",
  messagingSenderId: "314883662102",
};

// Try reading dynamic config from project root at runtime
function getFirebaseConfig() {
  try {
    const configPath = path.join(process.cwd(), "firebase-applet-config.json");
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn("Could not load dynamic firebase-applet-config.json, using fallback:", err);
  }
  return FALLBACK_CONFIG;
}

const firebaseConfig = getFirebaseConfig();

// Initialize application
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

/**
 * Retrieves data for the named store collection.
 * Maps arrays from multiple collection documents and single objects from a single.
 */
export async function getFirestoreStoreData(name: string): Promise<any> {
  const cleanName = name.trim().toLowerCase();
  
  // Decide if it falls under a collection array store vs single object store
  const isSingleConfig = ["page_overrides", "page-overrides"].includes(cleanName);

  try {
    if (isSingleConfig) {
      const colRef = collection(db, "single_configs");
      const snap = await getDocs(colRef);
      const docMatch = snap.docs.find(d => d.id === cleanName);
      if (docMatch) {
         return docMatch.data();
      }
      return null;
    } else {
      // Return list of array documents from matching collection
      const colRef = collection(db, cleanName);
      const snap = await getDocs(colRef);
      if (snap.empty) {
        return null; // Return null to fallback to local JSON/defaults files
      }
      const list = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      return list;
    }
  } catch (error) {
    console.error(`[FirebaseServer] Failed to fetch data for store [${name}]:`, error);
    return null;
  }
}

/**
 * Saves array/object structure to Firestore.
 * Handles incremental updates, deletion synching, and single configurations.
 */
export async function saveFirestoreStoreData(name: string, data: any): Promise<void> {
  const cleanName = name.trim().toLowerCase();
  const isSingleConfig = ["page_overrides", "page-overrides"].includes(cleanName);

  try {
    if (isSingleConfig) {
      // Overwrite single document configuration
      const docRef = doc(db, "single_configs", cleanName);
      await setDoc(docRef, data);
      console.log(`[FirebaseServer] Successfully persisted single config [${cleanName}] to Firestore.`);
    } else {
      const arr = Array.isArray(data) ? data : [data];
      const colRef = collection(db, cleanName);
      const existingSnap = await getDocs(colRef);
      const existingIds = existingSnap.docs.map(d => d.id);

      const incomingIds: string[] = [];

      // Write/update current records
      for (const item of arr) {
        if (!item || typeof item !== "object") continue;

        // Ensure we have a valid document id
        let itemId = item.id || item.invoiceNumber || item._id;
        if (!itemId) {
          // Fallback or hash key helper
          itemId = Math.random().toString(36).substring(2, 15);
          item.id = itemId;
        }

        const itemIdStr = String(itemId);
        incomingIds.push(itemIdStr);

        const docRef = doc(db, cleanName, itemIdStr);
        await setDoc(docRef, item);
      }

      // Delete items no longer present to synchronize sync deletions smoothly
      const toDelete = existingIds.filter(id => !incomingIds.includes(id));
      for (const deleteId of toDelete) {
        const docRef = doc(db, cleanName, deleteId);
        await deleteDoc(docRef);
        console.log(`[FirebaseServer] Synced deletion. Removed item [${deleteId}] from collection [${cleanName}].`);
      }

      console.log(`[FirebaseServer] Successfully persisted array store [${cleanName}] with ${arr.length} docs to Firestore.`);
    }
  } catch (error) {
    console.error(`[FirebaseServer] Failed to save data for store [${name}]:`, error);
    throw error;
  }
}
