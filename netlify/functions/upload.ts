import { Handler } from "@netlify/functions";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../src/utils/firebaseServer";

export const handler: Handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const { filename, fileType, base64Data } = JSON.parse(event.body || "{}");
    if (!base64Data) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Missing base64Data" }),
      };
    }

    // Parse base64 header
    const parts = base64Data.split(';base64,');
    if (parts.length < 2) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Invalid data URL format" }),
      };
    }

    const header = parts[0];
    const base64Content = parts[1];

    let ext = "bin";
    const mimeMatch = header.match(/data:(.*?)$/);
    if (mimeMatch && mimeMatch[1]) {
      const mimeType = mimeMatch[1];
      const typeExt = mimeType.split("/")[1];
      if (typeExt) {
        ext = typeExt.split("+")[0];
      }
    }

    const cleanName = filename 
      ? filename.toLowerCase().replace(/[^a-z0-9._-]/g, "") 
      : "media";
    
    const dotIdx = cleanName.lastIndexOf(".");
    const nameWithoutExt = dotIdx !== -1 ? cleanName.substring(0, dotIdx) : cleanName;
    const safeName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}_${nameWithoutExt}.${ext}`;

    // Record the uploaded media element inside Cloud Firestore 'uploaded_media'
    const docRef = doc(db, "uploaded_media", safeName);
    await setDoc(docRef, {
      id: safeName,
      filename: safeName,
      contentType: mimeMatch && mimeMatch[1] ? mimeMatch[1] : "application/octet-stream",
      base64: base64Content,
      createdAt: new Date().toISOString()
    });

    console.log(`[Netlify-Upload] Saved file [${safeName}] to Cloud Firestore.`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        url: `/src/assets/images/${safeName}`
      }),
    };
  } catch (err: any) {
    console.error("[Netlify-Upload] Save failed:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message || "Failed to persist media stream" }),
    };
  }
};
