import { Handler } from "@netlify/functions";
import { GoogleGenAI } from "@google/genai";

export const handler: Handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const { message, history } = JSON.parse(event.body || "{}");

    if (!message) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Message is required." }),
      };
    }

    const { GEMINI_API_KEY } = process.env;

    if (!GEMINI_API_KEY) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Server configuration error: GEMINI_API_KEY is missing in Netlify environment variables." }),
      };
    }

    const ai = new GoogleGenAI({
      apiKey: GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const systemPrompt = `You are the MADECC Assistant, a technical terminal for MADECC Construction Ltd, a premier structural engineering and construction firm. 
Your tone is professional, authoritative, and slightly futuristic/technical (using terms like "transmission", "matrix", "structural integrity", "artifact").
You provide assistance on structural engineering inquiries, construction project lifecycle, and MADECC services.
Services include: Building Construction, Civil Engineering, Structural Analysis, Project Management, and Urban Development.
MADECC Phone: +237 671063511 (Call), +237 683316486 (WhatsApp).
Location: Yaoundé, Cameroon.
If a question is complex, explain that you are analyzing the structural parameters and provide a detailed technical response.
Always maintain the MADECC brand identity.`;

    const chat = ai.chats.create({ 
      model: 'gemini-3.5-flash',
      config: {
        systemInstruction: systemPrompt,
      },
      history: history?.map((h: any) => ({
        role: h.role === 'model' ? 'model' : 'user',
        parts: h.parts.map((p: any) => ({ text: p.text }))
      })) || [],
    });

    const response = await chat.sendMessage({ message });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: response.text }),
    };
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Transmission interrupted. Please reset your connection." }),
    };
  }
};
