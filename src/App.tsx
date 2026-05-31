/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ServicesPage from "./pages/ServicesPage";
import PortfolioPage from "./pages/PortfolioPage";
import BlogPage from "./pages/BlogPage";
import BlogDetailPage from "./pages/BlogDetailPage";
import SocialLanding from "./pages/SocialLanding";
import PolicyPage from "./pages/PolicyPage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProjects from "./pages/admin/AdminProjects";
import AdminContracts from "./pages/admin/AdminContracts";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminEmployees from "./pages/admin/AdminEmployees";
import AdminInvoices from "./pages/admin/AdminInvoices";
import AdminContent from "./pages/admin/AdminContent";
import AdminSecurity from "./pages/admin/AdminSecurity";
import AdminReceipts from "./pages/admin/AdminReceipts";
import AdminLayout from "./components/admin/AdminLayout";
import { ContentProvider } from "./context/ContentContext";
import { AuthProvider, useAuth } from "./context/AuthContext";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-600/20 border-t-orange-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <ContentProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:id" element={<BlogDetailPage />} />
            <Route path="/social" element={<SocialLanding />} />
            <Route path="/privacy" element={<PolicyPage title="Privacy Policy" content={<PrivacyContent />} />} />
            <Route path="/cookies" element={<PolicyPage title="Cookie Policy" content={<CookieContent />} />} />
            <Route path="/terms" element={<PolicyPage title="Terms & Conditions" content={<TermsContent />} />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLoginPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            
            <Route path="/admin/dashboard" element={<ProtectedRoute><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/projects" element={<ProtectedRoute><AdminLayout><AdminProjects /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/contracts" element={<ProtectedRoute><AdminLayout><AdminContracts /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/payments" element={<ProtectedRoute><AdminLayout><AdminPayments /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/employees" element={<ProtectedRoute><AdminLayout><AdminEmployees /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/invoices" element={<ProtectedRoute><AdminLayout><AdminInvoices /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/receipts" element={<ProtectedRoute><AdminLayout><AdminReceipts /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/content" element={<ProtectedRoute><AdminContent /></ProtectedRoute>} />
            <Route path="/admin/security" element={<ProtectedRoute><AdminLayout><AdminSecurity /></AdminLayout></ProtectedRoute>} />
          </Routes>
        </Router>
      </ContentProvider>
    </AuthProvider>
  );
}

const PrivacyContent = () => (
  <div className="space-y-8">
    <p className="text-lg">At MADECC Construction Group, accessible from <span className="font-mono text-xs">https://madecc-constructionltd.online</span>, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by MADECC Construction and how we use it.</p>
    
    <div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">1. Consent</h3>
      <p>By using our website, you hereby consent to our Privacy Policy and agree to its terms.</p>
    </div>

    <div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">2. Information We Collect</h3>
      <p>The personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we ask you to provide your personal information.</p>
      <p className="mt-2">If you contact us directly, we may receive additional info such as your name, email address, phone number, physical site location, the contents of the message and/or attachments you may send us, and any other structural logs you choose to provide.</p>
    </div>

    <div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">3. How We Use Your Information</h3>
      <p>We use the information we collect in various ways, including to:</p>
      <ul className="list-disc pl-6 mt-2 space-y-1">
        <li>Provide, operate, and maintain our website and project administration terminals.</li>
        <li>Improve, personalize, and expand our digital content and construction portfolios.</li>
        <li>Understand and analyze how you interact with our design journals and blog articles.</li>
        <li>Develop new structural services, technical parameters, and interactive functionalities.</li>
        <li>Communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the website, and for marketing and promotional purposes.</li>
        <li>Detect, log, and prevent system-level threats or security breaches within our secure portal.</li>
      </ul>
    </div>

    <div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">4. Google DoubleClick DART Cookie & Third-Party Advertising</h3>
      <p>Google is one of the third-party vendors on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to our site and other sites on the internet.</p>
      <p className="mt-2">Our site may display advertisements curated by Google AdSense. Google AdSense uses cookies to analyze traffic, personalize advertising content, and measure performance. Visitors can choose to decline the use of DART cookies by visiting the Google ad and content network Privacy Policy at the following URL: <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-orange-600 underline">https://policies.google.com/technologies/ads</a>.</p>
    </div>

    <div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">5. Privacy Rights (GDPR & CCPA Compliant)</h3>
      <p>Under CCPA and GPDR, consumers have specific rights, including the right to:</p>
      <ul className="list-disc pl-6 mt-2 space-y-1">
        <li>Request that a business that collects a consumer's personal data disclose the categories and specific pieces of personal data collected.</li>
        <li>Request that a business delete any personal data about the consumer that has been collected.</li>
        <li>Request that a business that sells a consumer's personal data, not sell that personal data (opt-out list).</li>
        <li>Request rectification, restriction of processing, or portability of historical data records.</li>
      </ul>
      <p className="mt-2">If you make a request, we have one month to respond to you. If you would like to exercise any of these rights, please contact the MADECC compliance department via our physical terminal or email sequence.</p>
    </div>
  </div>
);

const CookieContent = () => (
  <div className="space-y-8">
    <p className="text-lg">Like any other professional website, MADECC Construction uses 'cookies'. These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information.</p>
    
    <div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">What Are Cookies?</h3>
      <p>Cookies are tiny files that are downloaded to your computer or mobile device to track, save, and store information about your interactions and usage of the website. This allows the website to provide a tailored experience within our system.</p>
    </div>

    <div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">Advertising Cookies & Tracking Partner Networks</h3>
      <p>To support our free technical journal publications, our advertising partners (including Google AdSense) track structural queries and visitor habits using high-integrity anonymous identifiers. These cookies ensure that the advertisements you see are relevant to your interests, preventing you from seeing the same banners repetitively.</p>
    </div>

    <div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">Disabling Cookies</h3>
      <p>You can prevent the setting of cookies by adjusting the settings on your browser (see your browser Help for how to do this). Be aware that disabling cookies will affect the functionality of this and many other websites that you visit. Disabling cookies will usually result in also disabling certain functionality and features of this site.</p>
    </div>
  </div>
);

const TermsContent = () => (
  <div className="space-y-8">
    <p className="text-lg">Welcome to MADECC Construction Group. These Terms & Conditions outline the rules and regulations for the use of our website and corporate terminals.</p>
    
    <div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">1. Intellectual Property Rights</h3>
      <p>Other than the content you own, under these Terms, MADECC Construction Group and/or its licensors own all the intellectual property rights and materials contained in this Website. All rights are reserved. You are granted a limited license only for purposes of viewing the material contained on this Website.</p>
    </div>

    <div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">2. Restrictions</h3>
      <p>You are specifically restricted from all of the following:</p>
      <ul className="list-disc pl-6 mt-2 space-y-1">
        <li>Publishing any Website design elements or structural photos in other media without direct CEO consent.</li>
        <li>Selling, sublicensing and/or otherwise commercializing any Website blueprints or assets.</li>
        <li>Using this Website in any way that is or may be damaging to this Website or our brand network.</li>
        <li>Using this Website contrary to applicable local and national laws, or in any way that causes harm to the Website, or to any person or business entity.</li>
        <li>Engaging in any data mining, data harvesting, data extracting or any other similar activity in relation to this Website.</li>
      </ul>
    </div>

    <div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">3. No Warranties</h3>
      <p>This Website is provided "as is," with all faults, and MADECC Construction Group expresses no representations or warranties of any kind related to this Website or the materials contained on this Website. Also, nothing contained on this Website shall be interpreted as advising you.</p>
    </div>

    <div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">4. Limitation of Liability</h3>
      <p>In no event shall MADECC Construction Group, nor any of its officers, directors and employees, be held liable for anything arising out of or in any way connected with your use of this Website whether such liability is under contract. MADECC Construction Group, including its officers, directors and employees shall not be held liable for any indirect, consequential or special liability arising out of or in any way related to your use of this Website.</p>
    </div>
  </div>
);
