import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "motion/react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import AboutSection from "../components/AboutSection";
import Services from "../components/Services";
import Portfolio from "../components/Portfolio";
import Testimonials from "../components/Testimonials";
import BlogSection from "../components/BlogSection";
import Newsletter from "../components/Newsletter";
import FAQ from "../components/FAQ";
import ContactForm from "../components/ContactForm";
import Footer from "../components/Footer";
import ChatWidget from "../components/ChatWidget";
import { useDocumentSEO } from "../hooks/useDocumentSEO";

export default function HomePage() {
  useDocumentSEO({
    title: "MADECC Construction Group | African Civil Engineering & Heavy Logistics",
    description: "MADECC Group is a premium vertical engineering and tropical civil infrastructure firm in Cameroon. Partner with us for multi-story towers, suspension bridges, dynamic logistics warehouses, and precise material supply lists.",
    keywords: "civil engineering Africa, Cameroon general contractor, structural estimators, concrete foundations, brutalist warehouses, highway infrastructure, CPJ-45 cement Yaounde"
  });

  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace("#", ""));
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [hash]);

  return (
    <div className="min-h-screen bg-slate-950 font-sans selection:bg-brand-secondary selection:text-white">
      <Navbar />
      <main>
        <Hero />
        <AboutSection />
        <Services />
        <Portfolio />
        <Testimonials />
        <BlogSection />
        <Newsletter />
        <FAQ />
        <ContactForm />
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
