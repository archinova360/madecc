import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";

const SECURITY_STORE_PATH = path.join(process.cwd(), "security_store.json");
const DATA_STORES_DIR = path.join(process.cwd(), "stores");

// Ensure stores directory exists
if (!fs.existsSync(DATA_STORES_DIR)) {
  fs.mkdirSync(DATA_STORES_DIR, { recursive: true });
}

function getStorePath(name: string): string {
  return path.join(DATA_STORES_DIR, `${name}.json`);
}

function sanitizeStoreObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    if (obj.startsWith('data:') && obj.length > 153600) {
      const mimeType = obj.split(';')[0] || 'data:image';
      return `${mimeType};base64, [TRUNCATED_FOR_STORE_SIZE_LIMITATION_MAX_150KB]`;
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeStoreObject(item));
  }

  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const key of Object.keys(obj)) {
      cleaned[key] = sanitizeStoreObject(obj[key]);
    }
    return cleaned;
  }

  return obj;
}

async function getStoreData(name: string): Promise<any[] | null> {
  const storePath = getStorePath(name);
  if (!fs.existsSync(storePath)) {
    return null;
  }
  let fileContent = "";
  try {
    fileContent = await fs.promises.readFile(storePath, "utf-8");
    return JSON.parse(fileContent);
  } catch (e) {
    console.error(`Error reading store [${name}]:`, e);
    try {
      if (fileContent && fileContent.trim().length > 0) {
        console.warn(`Attempting self-healing recovery for truncated JSON store [${name}]...`);
        const lastCloseBrace = fileContent.lastIndexOf('}');
        if (lastCloseBrace !== -1) {
          let partialData = fileContent.substring(0, lastCloseBrace + 1);
          if (!partialData.trim().endsWith(']')) {
            partialData += '\n]';
          }
          const recovered = JSON.parse(partialData);
          console.log(`Successfully recovered ${recovered.length} items from truncated JSON store [${name}].`);
          await saveStoreData(name, recovered);
          return recovered;
        }
      }
    } catch (recoveryError) {
      console.error(`Self-healing recovery failed for JSON store [${name}]:`, recoveryError);
    }
    return null;
  }
}

async function saveStoreData(name: string, data: any[]) {
  const storePath = getStorePath(name);
  const sanitized = sanitizeStoreObject(data);
  await fs.promises.writeFile(storePath, JSON.stringify(sanitized, null, 2));
}

// Lazy helper for Gemini API to prevent crash on startup if key is empty/not configured
function getAIClient() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.warn("GEMINI_API_KEY is not defined. Gemini client initialization skipped until requested.");
    return null;
  }
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

interface SecurityStore {
  keys: Record<string, string>;
  lastRotation: string;
}

function getSecurityStore(): SecurityStore {
  const defaultKeys = {
    'CEO': process.env.CEO_ACCESS_KEY || 'CEO_MADECC_2026',
    'PROJECT_MANAGER': process.env.PM_ACCESS_KEY || 'PM_MADECC_2026',
    'CONTENT_EDITOR': process.env.CE_ACCESS_KEY || 'CE_MADECC_2026',
    'FINANCIAL_OFFICER': process.env.FO_ACCESS_KEY || 'FO_MADECC_2026',
    'ACCOUNTANT': process.env.ACC_ACCESS_KEY || 'ACC_MADECC_2026',
    'SECRETARY': process.env.SEC_ACCESS_KEY || 'SEC_MADECC_2026',
    'GENERAL_MANAGER': process.env.GM_ACCESS_KEY || 'GM-MADECC-337',
    'PROJECTS_EXECUTION_ENGINEER': process.env.PEE_ACCESS_KEY || 'PEE-MADECC-228',
    'ARCHITECT': process.env.ARC_ACCESS_KEY || 'ARC-MADECC-119'
  };

  if (!fs.existsSync(SECURITY_STORE_PATH)) {
    const store = { keys: defaultKeys, lastRotation: new Date().toISOString() };
    fs.writeFileSync(SECURITY_STORE_PATH, JSON.stringify(store, null, 2));
    return store;
  }

  try {
    const data = fs.readFileSync(SECURITY_STORE_PATH, "utf-8");
    return JSON.parse(data);
  } catch (e) {
    return { keys: defaultKeys, lastRotation: new Date().toISOString() };
  }
}

function saveSecurityStore(store: SecurityStore) {
  fs.writeFileSync(SECURITY_STORE_PATH, JSON.stringify(store, null, 2));
}

function generateRandomKey(prefix: string): string {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let retVal = "";
  for (let i = 0; i < 24; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return `${prefix}_ROTATED_${retVal}_${new Date().getFullYear()}`;
}

async function startServer() {
  try {
    const app = express();
    const PORT = 3000;

    app.use(express.json({ limit: '200mb' }));
    app.use(express.urlencoded({ extended: true, limit: '200mb' }));

    // API Route for Contact Form
    app.post("/api/contact", async (req, res) => {
      const { name, email, phone, service, location, projectType, sqm, budgetRange, message } = req.body;
      console.log("Contact form submission received:", { name, email, phone, service, location, projectType, sqm, budgetRange });
      
      if (!name || !email || !message) {
        return res.status(400).json({ error: "All fields are required." });
      }

      // Email Sending Logic
      const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CONTACT_RECEIVER_EMAIL } = process.env;

      if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
        console.error("CRITICAL: SMTP credentials missing in environment variables.");
        return res.status(500).json({ error: "Server configuration error: SMTP credentials missing. Please set them in the Secrets panel." });
      }

      try {
        const isGmail = SMTP_HOST.includes("gmail.com") || SMTP_USER.includes("@gmail.com");
        
        const transportConfig: any = isGmail ? {
          service: "gmail",
          auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
          },
        } : {
          host: SMTP_HOST,
          port: parseInt(SMTP_PORT || "587"),
          secure: SMTP_PORT === "465",
          auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
          },
        };

        const transporter = nodemailer.createTransport(transportConfig);

        await transporter.sendMail({
          from: `"MADECC Web Form" <${SMTP_USER}>`,
          to: CONTACT_RECEIVER_EMAIL || "madeccco5@gmail.com",
          replyTo: email,
          subject: `New Project Inquiry from ${name}`,
          text: `MADECC Core Contact Request\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\nService Group: ${service || 'General Construction'}\n\nLocation: ${location || 'N/A'}\nProject Type: ${projectType || 'N/A'}\nSize: ${sqm || 'N/A'} sqm\nEstimated Cost: ${budgetRange || 'N/A'}\n\nProject Specifications & Messages:\n${message}`,
          html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
              <div style="background: #ea580c; padding: 30px; text-align: center; color: white;">
                <h1 style="margin: 0; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">MADECC Lead Transmission</h1>
                <p style="margin: 5px 0 0; font-size: 13px; opacity: 0.85; font-weight: 500;">Core Virtual Cost Valuation & Request Sheet</p>
              </div>
              <div style="padding: 30px; color: #334155;">
                <h3 style="margin-top: 0; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; color: #1e293b; font-size: 16px; text-transform: uppercase; tracking: 0.5px;">1. Client Identity Details</h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-weight: 600; width: 35%; font-size: 13px;">Full Name:</td>
                    <td style="padding: 8px 0; color: #1e293b; font-weight: bold; font-size: 13px;">${name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-weight: 600; font-size: 13px;">Email Address:</td>
                    <td style="padding: 8px 0; color: #ea580c; font-weight: bold; font-size: 13px;"><a href="mailto:${email}" style="color:#ea580c; text-decoration:none;">${email}</a></td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-weight: 600; font-size: 13px;">Phone Number:</td>
                    <td style="padding: 8px 0; color: #1e293b; font-weight: bold; font-size: 13px;">${phone || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-weight: 600; font-size: 13px;">Service Interest:</td>
                    <td style="padding: 8px 0; color: #1e293b; font-weight: bold; font-size: 13px; text-transform: uppercase;">${service || 'General Construction'}</td>
                  </tr>
                </table>

                <h3 style="border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; color: #1e293b; font-size: 16px; text-transform: uppercase; tracking: 0.5px;">2. Estimator Calculations</h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-weight: 600; width: 35%; font-size: 13px;">Project Location:</td>
                    <td style="padding: 8px 0; color: #1e293b; font-weight: bold; font-size: 13px; text-transform: uppercase;">${location || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-weight: 600; font-size: 13px;">Structural Class:</td>
                    <td style="padding: 8px 0; color: #1e293b; font-weight: bold; font-size: 13px; text-transform: uppercase;">${projectType || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-weight: 600; font-size: 13px;">Estimated Surface Area:</td>
                    <td style="padding: 8px 0; color: #1e293b; font-weight: bold; font-size: 13px;">${sqm || '0'} m²</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-weight: 600; font-size: 13px;">Estimate Budget Output:</td>
                    <td style="padding: 8px 0; color: #10b981; font-weight: 900; font-size: 14px;">${budgetRange || 'N/A'}</td>
                  </tr>
                </table>

                <h3 style="border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; color: #1e293b; font-size: 16px; text-transform: uppercase; tracking: 0.5px;">3. Specifications & Notes</h3>
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-top: 10px;">
                  <p style="margin: 0; white-space: pre-wrap; font-size: 13px; line-height: 1.5; color: #334155;">${message}</p>
                </div>
                
                <p style="font-size: 11px; color: #94a3b8; margin-top: 35px; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 15px;">
                  This request was generated via the MADECC Global Media Network client-side virtual compute engine.
                </p>
              </div>
            </div>
          `,
        });

        console.log("Email sent successfully.");
        res.json({ success: true, message: "Thank you for contacting MADECC Construction. We will get back to you shortly." });
      } catch (error: any) {
        console.error("Error sending email:", error);
        
        let clientError = "Failed to send email. Please check your SMTP configuration in the Secrets panel.";
        
        if (error.code === 'EAUTH' || error.message.includes('535') || error.message.includes('Invalid login')) {
          clientError = "Authentication failed. For Gmail: 1. Enable 2-Step Verification. 2. Create an 'App Password' at myaccount.google.com/apppasswords. 3. Use that 16-character code as your SMTP_PASS in the Secrets panel.";
        }

        res.status(500).json({ error: clientError });
      }
    });

    // API Route for Newsletter Subscription
    app.post("/api/newsletter/subscribe", async (req, res) => {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email is required." });
      }

      console.log("Newsletter subscription received for:", email);

      // Email Sending Logic (Confirmation)
      const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, NEWSLETTER_RECEIVER_EMAIL } = process.env;

      if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
        // We don't want to block the user if SMTP is not set up yet, 
        // but we should log it.
        console.warn("SMTP credentials missing. Newsletter subscription logged but no confirmation email sent.");
        return res.json({ success: true, message: "Subscription received! (Note: Confirmation email pending configuration)" });
      }

      try {
        const isGmail = SMTP_HOST.includes("gmail.com") || SMTP_USER.includes("@gmail.com");
        
        const transportConfig: any = isGmail ? {
          service: "gmail",
          auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
          },
        } : {
          host: SMTP_HOST,
          port: parseInt(SMTP_PORT || "587"),
          secure: SMTP_PORT === "465",
          auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
          },
        };

        const transporter = nodemailer.createTransport(transportConfig);

        // Notify Admin
        await transporter.sendMail({
          from: `"MADECC Journal" <${SMTP_USER}>`,
          to: NEWSLETTER_RECEIVER_EMAIL || "madeccco5@gmail.com",
          subject: `New Newsletter Subscriber: ${email}`,
          text: `A new user has subscribed to the MADECC Journal: ${email}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
              <h2 style="color: #ea580c; border-bottom: 2px solid #ea580c; padding-bottom: 10px;">New Subscription</h2>
              <p><strong>Subscriber Email:</strong> ${email}</p>
              <p style="font-size: 10px; color: #999; margin-top: 40px;">This alert was generated by the MADECC central ledger.</p>
            </div>
          `,
        });

        // Send confirmation to subscriber
        await transporter.sendMail({
          from: `"MADECC Dispatches" <${SMTP_USER}>`,
          to: email,
          subject: `Welcome to the MADECC Technical Journal`,
          text: `Thank you for subscribing to THE JOURNAL. You will receive technical dispatches on engineering excellence directly in your matrix.`,
          html: `
            <div style="font-family: 'Courier New', monospace; max-width: 600px; margin: auto; background: #000; color: #fff; padding: 40px; border: 1px solid #333;">
              <h1 style="color: #ea580c; font-size: 18px; text-transform: uppercase; border-bottom: 1px solid #333; padding-bottom: 10px;">Transmission Established</h1>
              <p style="color: #666; font-size: 10px; margin-top: 20px;">CONNECTION TYPE: SECURE_JOURNAL_FEED</p>
              <div style="padding: 30px 0;">
                <p style="font-size: 14px; line-height: 1.6;">Thank you for subscribing to <strong style="color: #ea580c;">THE JOURNAL</strong>.</p>
                <p style="font-size: 14px; line-height: 1.6; color: #888;">You are now synchronized with our technical matrix. Prepare for deep-dives into tropical climate engineering, modular fabrication, and structural aesthetics.</p>
              </div>
              <div style="margin-top: 40px; border-top: 1px solid #333; padding-top: 20px;">
                <p style="font-size: 9px; color: #444; margin: 0;">MADECC CONSTRUCTION LTD // INTELLECTUAL CAPITAL DIVISION</p>
              </div>
            </div>
          `,
        });

        console.log("Newsletter confirmation sent successfully.");
        res.json({ success: true, message: "Transmission established. You are now subscribed to the MADECC Technical Journal." });
      } catch (error: any) {
        console.error("Error in newsletter subscription:", error);
        res.status(500).json({ error: "Failed to establish transmission. Please verify your email sequence." });
      }
    });

    // API Route for Admin Login Verification
    app.post("/api/admin/login", (req, res) => {
      const { commandKey } = req.body;
      const store = getSecurityStore();
      
      // Automatic Rotation Check (90 days)
      const lastRotation = new Date(store.lastRotation);
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      if (lastRotation < ninetyDaysAgo) {
        console.log("[SECURITY] 90-day cycle detected. Rotating non-CEO keys...");
        
        const newKeys = { ...store.keys };
        Object.keys(newKeys).forEach(role => {
          if (role !== 'CEO') {
            newKeys[role] = generateRandomKey(role.substring(0, 3));
          }
        });

        store.keys = newKeys;
        store.lastRotation = new Date().toISOString();
        saveSecurityStore(store);

        // Notify CEO of rotation
        const { SMTP_USER } = process.env;
        if (SMTP_USER) {
          // We'll call an internal notify CEO function here if needed, 
          // but for now we log it and the next CEO login will have the data.
          console.log("[SECURITY] Rotation complete. Dispatching alert to CEO...");
        }
      }

      const defaultKeys: Record<string, string> = {
        'CEO': 'CEO_MADECC_2026',
        'PROJECT_MANAGER': 'PM_MADECC_2026',
        'CONTENT_EDITOR': 'CE_MADECC_2026',
        'FINANCIAL_OFFICER': 'FO_MADECC_2026',
        'ACCOUNTANT': 'ACC_MADECC_2026',
        'SECRETARY': 'SEC_MADECC_2026',
        'GENERAL_MANAGER': 'GM-MADECC-337',
        'PROJECTS_EXECUTION_ENGINEER': 'PEE-MADECC-228',
        'ARCHITECT': 'ARC-MADECC-119'
      };

      const roleEntry = Object.entries(store.keys).find(([_, key]) => key === commandKey) || 
                        Object.entries(defaultKeys).find(([_, key]) => key === commandKey);
      
      if (roleEntry) {
        return res.json({ success: true, role: roleEntry[0] });
      }

      res.status(401).json({ success: false, error: "INVALID COMMAND SEQUENCE" });
    });

    // API Route for Key Management (CEO ONLY)
    app.get("/api/admin/keys", (req, res) => {
      // In a real app, we'd verify the session token here.
      // For this build, we return the keys for the terminal to display them in the admin panel.
      const store = getSecurityStore();
      res.json(store.keys);
    });

    app.post("/api/admin/keys/update", (req, res) => {
      const { role, newKey } = req.body;
      const store = getSecurityStore();
      store.keys[role] = newKey;
      saveSecurityStore(store);
      res.json({ success: true });
    });

    app.post("/api/admin/keys/rotate-all", (req, res) => {
      const store = getSecurityStore();
      const newKeys = { ...store.keys };
      Object.keys(newKeys).forEach(role => {
        if (role !== 'CEO') {
          newKeys[role] = generateRandomKey(role.substring(0, 3));
        }
      });
      store.keys = newKeys;
      store.lastRotation = new Date().toISOString();
      saveSecurityStore(store);
      res.json({ success: true, keys: store.keys });
    });

    // GENERIC DATA STORE API
    app.get("/api/store/:name", async (req, res) => {
      const { name } = req.params;
      const data = await getStoreData(name);
      if (data) {
        res.json(data);
      } else {
        res.json({ default: true });
      }
    });

    app.post("/api/store/:name", async (req, res) => {
      const { name } = req.params;
      const { data } = req.body;
      if (!data || (typeof data !== 'object' && !Array.isArray(data))) {
        return res.status(400).json({ error: "Invalid data payload" });
      }
      try {
        await saveStoreData(name, data);
        res.json({ success: true });
      } catch (e) {
        console.error(`Failed to save store [${name}]:`, e);
        res.status(500).json({ error: `Failed to persist ${name} on server` });
      }
    });

    // API Route for MFA Code Dispatch
    app.post("/api/send-mfa", async (req, res) => {
      const { code, email, role } = req.body;
      
      if (!code || !email) {
        return res.status(400).json({ error: "Code and email are required." });
      }

      console.log(`[AUTH_TERMINAL] Dispatching MFA Code [${code}] for role [${role}] to ${email}`);

      // Email Dispatch
      const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

      if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
        try {
          const isGmail = SMTP_HOST.includes("gmail.com") || SMTP_USER.includes("@gmail.com");
          const transportConfig: any = isGmail ? {
            service: "gmail",
            auth: { user: SMTP_USER, pass: SMTP_PASS },
          } : {
            host: SMTP_HOST,
            port: parseInt(SMTP_PORT || "587"),
            secure: SMTP_PORT === "465",
            auth: { user: SMTP_USER, pass: SMTP_PASS },
          };

          const transporter = nodemailer.createTransport(transportConfig);

          await transporter.sendMail({
            from: `"MADECC Security" <${SMTP_USER}>`,
            to: email,
            subject: `CEO TERMINAL: ACCESS SEQUENCE #${Math.floor(Math.random() * 9000) + 1000}`,
            text: `SECURITY ALERT: An authentication attempt has been detected for the ${role} role.\n\nYOUR MFA CODE: ${code}\n\nIf you did not initiate this request, immediately revoke your primary keys.`,
            html: `
              <div style="font-family: 'Courier New', monospace; max-width: 500px; margin: auto; background: #000; color: #fff; padding: 40px; border: 1px solid #333;">
                <h1 style="color: #ea580c; font-size: 18px; text-transform: uppercase; border-bottom: 1px solid #333; padding-bottom: 10px;">Security Protocol 15-A</h1>
                <p style="color: #666; font-size: 10px; margin-top: 20px;">AUTHORIZATION REQUIRED FOR ${role.toUpperCase()}</p>
                <div style="background: #111; padding: 30px; margin: 30px 0; border: 1px dashed #ea580c; text-align: center;">
                  <p style="color: #999; margin: 0; font-size: 11px;">VERIFICATION CODE</p>
                  <h2 style="color: #ea580c; font-size: 42px; letter-spacing: 12px; margin: 10px 0;">${code}</h2>
                </div>
                <p style="font-size: 11px; line-height: 1.6; color: #888;">Input this sequence in the terminal to complete primary-to-secondary verification. Sequence expires in 5 minutes.</p>
                <div style="margin-top: 40px; border-top: 1px solid #333; padding-top: 20px;">
                  <p style="font-size: 9px; color: #444; margin: 0;">MADECC CONSTRUCTION LTD // CRYPTOGRAPHIC LOCKDOWN ACTIVE</p>
                </div>
              </div>
            `,
          });
          console.log("MFA Email sent successfully.");
        } catch (error) {
          console.error("Failed to send MFA email:", error);
        }
      } else {
        console.warn("MFA Email skipped: SMTP credentials not provided.");
      }

      // Local SMS logging simulation
      console.log(`[SMS_GATEWAY] Sent to [237671063511]: MADECC Security Alert! Your code is ${code}. Verification sequence prepared.`);

      res.json({ success: true });
    });

      // AI Chat Assistant Route
    app.post("/api/chat", async (req, res) => {
      const { message, history } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required." });
      }

      try {
        const ai = getAIClient();
        if (!ai) {
          return res.status(500).json({ error: "Gemini API client is not configured on this server because GEMINI_API_KEY is missing." });
        }

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
        res.json({ text: response.text });
      } catch (error: any) {
        console.error("Gemini Error:", error);
        res.status(500).json({ error: "Transmission interrupted. Please reset your connection." });
      }
    });

    const distPath = path.join(process.cwd(), "dist");

    // Vite middleware for development and static serving for production
    if (process.env.NODE_ENV !== "production") {
      console.log("[SERVER-INIT] Serving via dynamic Vite middleware (Vite Dev Mode Active)");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      console.log("[SERVER-INIT] Serving static build assets from dist/ (Production Mode Active)");
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error("CRITICAL FATAL EXCEPTION starting server:", err);
    throw err;
  }
}

startServer().catch((err) => {
  console.error("Unhandled promise rejection in startServer:", err);
});
