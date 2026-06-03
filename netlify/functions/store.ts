import { Handler } from "@netlify/functions";
import { getFirestoreStoreData, saveFirestoreStoreData } from "../../src/utils/firebaseServer";

export const handler: Handler = async (event) => {
  // CORS Headers for browser requests
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  // Extract the collection/store name from the last URL segment
  // e.g. path "/api/store/projects" -> segments = ["api", "store", "projects"] -> name = "projects"
  const segments = event.path.split("/").filter(Boolean);
  const name = segments[segments.length - 1];

  if (!name) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Store/Collection name is missing in request path." }),
    };
  }

  try {
    if (event.httpMethod === "GET") {
      console.log(`[Netlify-Store] Fetching storage entity: "${name}"`);
      const storeData = await getFirestoreStoreData(name);
      
      if (storeData) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(storeData),
        };
      } else {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ default: true }),
        };
      }
    } 
    
    if (event.httpMethod === "POST") {
      const { data } = JSON.parse(event.body || "{}");
      if (!data) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: "Invalid payload: missing 'data' attribute" }),
        };
      }

      console.log(`[Netlify-Store] Updating storage entity: "${name}"`);
      await saveFirestoreStoreData(name, data);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: `Successfully replicated ${name} to Cloud Firestore` }),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: `Method ${event.httpMethod} Not Allowed` }),
    };
  } catch (error: any) {
    console.error(`[Netlify-Store] Failed operation on store "${name}":`, error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || "Internal server error" }),
    };
  }
};
