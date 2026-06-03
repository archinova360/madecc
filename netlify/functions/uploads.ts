import { Handler } from "@netlify/functions";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../src/utils/firebaseServer";

export const handler: Handler = async (event) => {
  // Extract path from event
  const segments = event.path.split("/").filter(Boolean);
  const safeName = segments[segments.length - 1];

  const headers: Record<string, string> = {
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "public, max-age=31536000"
  };

  if (!safeName) {
    return {
      statusCode: 404,
      headers,
      body: "Not Found",
    };
  }

  try {
    const docRef = doc(db, "uploaded_media", safeName);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const contentType = data.contentType || "image/jpeg";
      const base64Content = data.base64;

      return {
        statusCode: 200,
        headers: {
          ...headers,
          "Content-Type": contentType
        },
        body: base64Content,
        isBase64Encoded: true
      };
    }

    return {
      statusCode: 404,
      headers: { "Content-Type": "text/plain" },
      body: `Asset ${safeName} not found in Firestore replica.`,
    };
  } catch (err: any) {
    console.error("[Netlify-Uploads-Serve] Serving failed:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "text/plain" },
      body: "Failed to load media payload.",
    };
  }
};
