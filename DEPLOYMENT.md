# MADECC Construction - Deployment & Publishing Guide

This guide describes how to publish and deploy the **MADECC Construction Web Portal** (a full-stack React + Express + Gemini AI + SMTP Mailer application) to **GitHub**, **Netlify**, and **Namecheap Hosting**.

---

## 🏛️ Architectural Considerations: Choosing Where to Deploy

Our platform utilizes high-integrity components, including a secure admin control center, cryptographic keys, an AI Assistant (Gemini), and disk-based file persistence under `/stores/*.json` (for real-time contract database, signature storage, and threat logs).

| Strategy | Support for Static Assets | Support for APIs & AI Chat | Disk-File Database Persistence (`/stores`) | Best Fit For |
| :--- | :--- | :--- | :--- | :--- |
| **GitHub Pages** *(Static)* | 🟢 Yes | 🔴 No (Static-only) | 🔴 No (Stale/Read-only) | Static preview of layout only |
| **Netlify** *(Serverless)* | 🟢 Yes | 🟢 Yes (Using Netlify Functions) | 🟡 Ephemeral (Files reset on cold-start) | Continuous integration & rapid staging |
| **Namecheap Node.JS App** | 🟢 Yes | 🟢 Yes (Using full Node Express app) | 🟢 Yes (True Local disk persistence) | Permanent production with fully active backend state |

---

## 📂 1. Preparing the Codebase

Our repository comes with custom configurations that make it fully ready to compile and run across serverless handlers and standard servers:
- **`netlify.toml`** and **`/netlify/functions/`**: Holds pre-built edge controllers matching backend endpoints `/api/contact` and `/api/chat`.
- **`package.json`**: Pre-configured build systems utilizing `esbuild` to compile standard server-side TypeScript into a bundled `dist/server.cjs` module.

Make sure your files contain the deployment assets:
1. All static browser code compiles to output directory `/dist`.
2. All server logic compiles to output file `/dist/server.cjs`.

---

## 🐙 2. GitHub Publishing

To put your project on GitHub (enabling code backups, version control, and continuous integration with Netlify):

### Step 2.1: Initialize GitHub Repository
1. Log into [GitHub](https://github.com).
2. Click **New** under the Repositories section.
3. Set the Repository Name (e.g., `madecc-portal`), choose **Private** (recommended to hide your brand guidelines and structural parameters), and do **NOT** initialized with a README or `.gitignore` (as these are already configured in the folder).
4. Click **Create repository**.

### Step 2.2: Push Existing Code via Git CLI
Open a terminal in your project's root folder and run:
```bash
# Initialize git in local folder
git init

# Add all files to staging index (respects our established .gitignore)
git add .

# Commit local changes
git commit -m "feat: complete unified print layouts, Netlify functions, and deployment support"

# Link to GitHub remote (Replace with your actual GitHub username and repository)
git remote add origin https://github.com/YOUR_USERNAME/madecc-portal.git

# Rename main branch
git branch -M main

# Force push to origin
git push -u origin main
```

---

## ⚡ 3. Netlify Deployment (Serverless API & Static Frontend)

Deploying to Netlify links your GitHub repository directly to Netlify's Edge CDN. Whenever you push new updates to GitHub, Netlify automatically updates your live site.

### Step 3.1: Connect Repository to Netlify
1. Log into [Netlify](https://www.netlify.com).
2. Click **Add new site** -> **Import from Git**.
3. Choose **GitHub** and authorize Netlify.
4. Select your repository `madecc-portal`.

### Step 3.2: Configure Build Settings
Netlify will automatically detect our `netlify.toml` and configure itself. Double check that the build settings match the parameters below:
- **Build Command**: `npm run build`
- **Publish directory**: `dist`
- **Functions directory**: `netlify/functions`

### Step 3.3: Set Environment Secrets
Since API keys must never be exposed to the client browser, you must input them in Netlify's environment manager:
1. In the Netlify Dashboard, navigate to **Site configuration** -> **Environment variables**.
2. Click **Add a variable** and define the keys from our `.env.example`:
   - `GEMINI_API_KEY` (Generated from Google AI Studio)
   - `GOOGLE_MAPS_PLATFORM_KEY` (Required for geographical map interfaces)
   - `SMTP_HOST` (e.g., mail server or `smtp.gmail.com`)
   - `SMTP_PORT` (e.g., `587` or `465`)
   - `SMTP_USER` (Sender email account, e.g., `info@yourdomain.com`)
   - `SMTP_PASS` (Sender email password or Google App Password)
   - `CEO_ACCESS_KEY` / `PM_ACCESS_KEY` / `CE_ACCESS_KEY` / `FO_ACCESS_KEY` / `ACC_ACCESS_KEY` / `SEC_ACCESS_KEY` (Custom passwords for personnel terminals)
3. Click **Deploy Site**. Netlify will build the static visual layer and activate `/netlify/functions/contact` and `/netlify/functions/chat` serverless modules.

---

## 🏛️ 4. Namecheap Hosting (Node.js Application Setup)

Traditional cPanel Shared Hosting on Namecheap (or similar panels) supports persistent Node.js instances. This is **strongly recommended** for our setup because the server keeps disk files like `security_store.json` and `/stores/*.json` permanently (keeping your system logs, signatures, contracts, and custom administrative keys safe without a third-party DB).

### Step 4.1: Compile the Production Bundle Locally
Before uploading, build the server components together with Vite's static layouts.
```bash
# In your local project directory:
npm run build
```
This produces a fully compiled, self-contained `/dist` folder containing:
- All compiled HTML, CSS, client-side JS bundled for the browser.
- A bundled single-file server script **`dist/server.cjs`** for Node execution.

### Step 4.2: Upload Project files to cPanel
1. Access Namecheap cPanel.
2. Open **File Manager** and create a directory outside public HTML for your backend code (e.g., `/home/username/madecc-app/`).
3. Upload and extract your project files to this folder.
   > ⚠️ **CRITICAL: EXCLUDE `node_modules`** from the upload. This contains heavy operating-system-specific binaries that will fail if copied between windows/mac and Namecheap's Linux runtime. Let Namecheap build them freshly on-cpu!
4. Ensure target directories include:
   - `/dist/`
   - `/stores/`
   - `package.json`
   - `tsconfig.json`

### Step 4.3: Configure cPanel "Setup Node.js App"
1. In cPanel, search for **Setup Node.js App** (powered by Phusion Passenger).
2. Click **Create Application**.
3. Complete the following fields:
   - **Node.js version**: Select `20.x` or `22.x` (Matching modern standards).
   - **Application Mode**: `development` or `production`.
   - **Application root**: `madecc-app` (Your root code upload folder).
   - **Application URL**: Select your domain (e.g., `https://madecc-construction.com` or subdomain).
   - **Application startup file**: `dist/server.cjs` (Our single-bundle backend file).
4. Under **Environment variables**, click **Add Variable** and copy over all production variables:
   - `NODE_ENV` = `production`
   - `GEMINI_API_KEY` = `your_gemini_key_here`
   - `GOOGLE_MAPS_PLATFORM_KEY` = `your_maps_key_here`
   - `SMTP_HOST` = `mail.yourdomain.com` or `smtp.gmail.com`
   - `SMTP_PORT` = `587`
   - `SMTP_USER` = `contact@yourdomain.com`
   - `SMTP_PASS` = `your_smtp_app_password`
   - `CEO_ACCESS_KEY` & other personnel codes.
5. Click **Create**.

### Step 4.4: Install Server Dependencies On Namecheap
1. Inside cPanel Node.js application screen, look for **Run JS NPM Install** button.
2. Click **Run NPM Install**. This runs `npm install` inside the Linux host container safely, fetching dependencies like `express` and `nodemailer` directly from registry buffers.
3. Click **Restart application**.
4. Your full-stack platform is now live! The Express runtime processes all traffic on the main URL and redirects index traffic to the UI index. All local disk structures inside `/stores/*.json` remain active and non-volatile.

---

## 📢 5. Google AdSense Setup & Verification Guide

Our platform is ready for AdSense integration. We have already injected the global script snippet into the application head and bundled the required authorized digital seller parameters.

### Step 5.1: Confirm AdSense Placement Elements
1. **AdSense Global Script**: The script tag has been successfully embedded in the `<head>` tag of `/index.html`:
   ```html
   <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4074318790162659"
     crossorigin="anonymous"></script>
   ```
   *This loads Google's Auto Ads script automatically across all routes dynamically parsed by React Router.*
2. **Authorized Sellers (`ads.txt`)**: A certified, crawler-compliant text mapping is established in `/public/ads.txt`:
   ```text
   google.com, pub-4074318790162659, DIRECT, f08c47fec0942fa0
   ```
   *When deployed via Netlify or Namecheap, files in `/public` compile directly to the root path, making them instantly available at `https://madecc-constructionltd.online/ads.txt`.*

### Step 5.2: Register Domain in AdSense Console
1. Log into your [Google AdSense Console](https://adsense.google.com).
2. Go to **Sites** -> **Add site**.
3. Input your top-level domain: `madecc-constructionltd.online`.
4. Choose your verification method:
   - **AdSense code snippet**: Since we already embedded your `ca-pub-4074318790162659` snippet, Google will recognize this instantly.
   - **Ads.txt matching**: Recommended fallback. Confirm the crawler can access your domain path.
5. Click **Verify** followed by **Request review**.

### Step 5.3: Passing AdSense Quality Audits
Google audits pages for high-quality information Architecture and legal disclosure. Our portal exceeds these thresholds through:
- **Comprehensive Legal Disclosures**: Fully articulated, interactive **Privacy Policy**, **Cookie Declaration**, and **Terms of Service** modals mapped seamlessly into the footer layout.
- **Dynamic Content Diversity**: Clean architectural blog sections, construction project portfolios, and an in-house technical journal layout loaded with rich terminology.
- **Flawless Mobile Responsive Design**: Built strictly using fluid Tailwind grids and accessible typography scaling designed to maintain layout precision under heavy advertising blocks.

---

## 🛠️ Maintenance & Local Security Auditing

If you add personnel terminal keys or observe a logging audit failure:
1. All changes can be previewed locally using `npm run dev`.
2. Inspect the local `/stores/threat_logs.json` to verify digital footprint tracking, MFA emails, or security incidents directly on development machines.
3. Keep your SMTP email up to date with App Passwords to prevent standard authorization lockout failures.
