import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useDocumentSEO } from "../hooks/useDocumentSEO";

export default function PolicyPage({ title, content }: { title: string, content: React.ReactNode }) {
  useDocumentSEO({
    title: `${title} | MADECC Construction Group Cameroon`,
    description: `Read the official ${title} for MADECC Construction Group. GDPR compliant information, cookie tracking disclaimers, Google AdSense integration protocols, and legal project management conditions.`,
    keywords: `${title.toLowerCase()}, madecc compliance, building terms, legal construction conditions`
  });

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-32 pb-20 max-w-4xl mx-auto px-6">
        <h1 className="text-5xl font-bold tracking-tighter uppercase mb-12">{title}</h1>
        <div className="prose prose-zinc max-w-none text-gray-600 leading-relaxed space-y-6">
          {content}
        </div>
      </main>
      <Footer />
    </div>
  );
}
