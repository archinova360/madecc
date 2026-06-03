import { Handler } from "@netlify/functions";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../src/utils/firebaseServer";

const defaultKeys = {
  "CEO": "CEO_MADECC_2026",
  "PROJECT_MANAGER": "PM_MADECC_2026",
  "CONTENT_EDITOR": "CE_MADECC_2026",
  "FINANCIAL_OFFICER": "FO_MADECC_2026",
  "ACCOUNTANT": "ACC_MADECC_2026",
  "SECRETARY": "SEC_MADECC_2026",
  "GENERAL_MANAGER": "GM-MADECC-337",
  "PROJECTS_EXECUTION_ENGINEER": "PEE-MADECC-228",
  "ARCHITECT": "ARC-MADECC-119"
};

function generateRandomKey(prefix: string): string {
  return `${prefix.toUpperCase()}-MADECC-${Math.floor(100 + Math.random() * 900)}`;
}

async function getOrInitSecurityStore() {
  const docRef = doc(db, "single_configs", "security_store");
  try {
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data();
    } else {
      const initial = { keys: defaultKeys, lastRotation: new Date().toISOString() };
      await setDoc(docRef, initial);
      return initial;
    }
  } catch (err) {
    console.warn("[Netlify-Admin] Failed to load from Firestore, using local defaults:", err);
    return { keys: defaultKeys, lastRotation: new Date().toISOString() };
  }
}

export const handler: Handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  const path = event.path;
  const action = event.queryStringParameters?.action || 
                 (path.endsWith("/admin/keys") ? "keys" : 
                  path.endsWith("/update") ? "keys/update" : 
                  path.endsWith("/rotate-all") ? "keys/rotate-all" : "");

  try {
    const sStore = await getOrInitSecurityStore();

    // 1. GET /api/admin/keys
    if (event.httpMethod === "GET" && action === "keys") {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(sStore.keys),
      };
    }

    // 2. POST /api/admin/keys/update
    if (event.httpMethod === "POST" && action === "keys/update") {
      const { role, newKey } = JSON.parse(event.body || "{}");
      if (!role || !newKey) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: "Missing role or newKey" }),
        };
      }

      sStore.keys[role] = newKey;
      await setDoc(doc(db, "single_configs", "security_store"), sStore);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true }),
      };
    }

    // 3. POST /api/admin/keys/rotate-all
    if (event.httpMethod === "POST" && action === "keys/rotate-all") {
      const newKeys: Record<string, string> = { ...sStore.keys };
      Object.keys(newKeys).forEach(role => {
        if (role !== "CEO") {
          newKeys[role] = generateRandomKey(role.substring(0, 3));
        }
      });

      sStore.keys = newKeys;
      sStore.lastRotation = new Date().toISOString();

      await setDoc(doc(db, "single_configs", "security_store"), sStore);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, keys: newKeys }),
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: `Not Found: ${path}` }),
    };
  } catch (err: any) {
    console.error("[Netlify-Admin] Internal error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message || "Internal server error" }),
    };
  }
};
