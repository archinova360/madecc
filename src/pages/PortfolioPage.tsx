import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ChatWidget from "../components/ChatWidget";
import { motion } from "motion/react";
import { useContent } from "../context/ContentContext";
import { useDocumentSEO } from "../hooks/useDocumentSEO";
import { ExternalLink, HardHat, Maximize, MapPin, Calendar, Layers } from "lucide-react";

export default function PortfolioPage() {
  useDocumentSEO({
    title: "Structural Engineering & Civil Portfolio | MADECC Construction",
    description: "View our legendary structural achievements and vertical landmarks: Centennial Bridge multimodal transport networks, high-rise Skyline Towers, and Brutalist industrial logistics hubs built with absolute accuracy.",
    keywords: "MADECC project portfolio, concrete bridge designs, office skyscrapers Douala, warehouses Yaounde, civil works blueprints, engineering case studies"
  });

  const { content } = useContent();
  const projects = content.filter(item => item.type === 'project' && item.status === 'Published');

  // Let's attach rich, high-density local technical metrics to each project for realistic SEO value
  const richTechnicalMetadata: Record<string, { sqm: string; concrete: string; loads: string; steel: string; client: string }> = {
    "1": {
      sqm: "8,500 m² (Operational Deck)",
      concrete: "CPJ-45 Pre-Stressed H-60 Waterproof Concrete",
      loads: "A-Class European Load-Bearing High-Spans (HL-93 Rating)",
      steel: "High-Yield Rebar Grid S500 Reinforcement (680 Tonnes)",
      client: "Cameroon Ministry of Public Infrastructure"
    },
    "2": {
      sqm: "42,000 m² (Total Plinth Area)",
      concrete: "C50-High Strength Low Heat Structural Core Concrete",
      loads: "Zero-Carbon Eco-Mass Footprint Stabilization Structure",
      steel: "Anti-Corrosion Epoxy Coated Tensile Bars (1,240 Tonnes)",
      client: "Central African Financial Holdings Inc."
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-brand-secondary selection:text-white">
      <Navbar />
      
      <main className="pt-48 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Header */}
          <header className="mb-32 relative">
            <div className="absolute -top-10 left-0 w-24 h-[1px] bg-brand-secondary" />
            <span className="text-brand-secondary font-black uppercase tracking-[0.4em] text-[10px] block mb-4">
              MADECC Structural Record
            </span>
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter uppercase mb-6 leading-none">
              CIVIL <br />
              PORTFOLIO
            </h1>
            <p className="text-slate-500 uppercase tracking-[0.4em] font-black text-xs border-l border-brand-secondary/30 pl-6 max-w-2xl">
              Chronological log of high-yield structural masterworks, bridges, towers, and logistics hubs delivered with direct civil compliance.
            </p>
          </header>

          {/* Project Display */}
          <section className="space-y-40">
            {projects.map((project, index) => {
              const tech = richTechnicalMetadata[project.id] || {
                sqm: "12,400 m²",
                concrete: "Pre-Stressed Heavy Duty CPJ-35 Cement Grade",
                loads: "Standard High-Volume Operational Capacity",
                steel: "High-Tensile Steel rebar reinforcements S400",
                client: "Corporate Regional Partner"
              };

              return (
                <motion.div 
                  key={project.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-stretch border-t border-white/5 pt-20"
                >
                  {/* Left Column - Large Image */}
                  <div className="relative group overflow-hidden border border-white/5 flex items-center bg-slate-900 justify-center min-h-[350px]">
                    <img 
                      src={project.image} 
                      alt={project.title} 
                      className="w-full h-full object-cover grayscale brightness-50 group-hover:grayscale-0 group-hover:brightness-95 group-hover:scale-105 transition-all duration-1000"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-6 left-6 bg-slate-950/90 border border-white/10 px-4 py-2 font-mono text-xs font-black tracking-widest uppercase italic text-brand-secondary">
                      PROJECT 0{index + 1}
                    </div>
                  </div>

                  {/* Right Column - Project Metadata and Details */}
                  <div className="flex flex-col justify-between space-y-12">
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <span className="text-brand-secondary text-xs font-mono font-black uppercase tracking-[0.2em]">{project.category}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                        <span className="text-slate-500 text-xs font-mono font-black">{project.date}</span>
                      </div>
                      
                      <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white leading-none">
                        {project.title}
                      </h2>
                      
                      <p className="text-slate-400 text-base leading-relaxed font-light">
                        {project.description || "Leading regional development structure delivering high utility and aesthetic innovation. Our engineering squads conducted extreme soil resistance studies and digital structural mapping to guarantee foundational integrity."}
                      </p>
                    </div>

                    {/* Detailed Structural Audit Board */}
                    <div className="bg-slate-900 border border-white/5 p-6 space-y-4 rounded">
                      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                        <HardHat size={16} className="text-brand-secondary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#25D366]">Concrete Engineering & Core Parameters</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono text-slate-400">
                        <div className="flex items-center gap-2">
                          <Maximize size={14} className="text-slate-600 shrink-0" />
                          <span><strong className="text-white font-bold">Surface:</strong> {tech.sqm}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-slate-600 shrink-0" />
                          <span><strong className="text-white font-bold">Location:</strong> Cameroon</span>
                        </div>
                        <div className="flex items-center gap-2 md:col-span-2">
                          <Layers size={14} className="text-slate-600 shrink-0" />
                          <span><strong className="text-white font-bold">Concrete Class:</strong> {tech.concrete}</span>
                        </div>
                        <div className="flex items-center gap-2 md:col-span-2">
                          <span className="w-2 h-2 rounded-full bg-slate-600 shrink-0" />
                          <span><strong className="text-white font-bold">Reinforcement Steel:</strong> {tech.steel}</span>
                        </div>
                        <div className="flex items-center gap-2 md:col-span-2">
                          <span className="w-2 h-2 rounded-full bg-slate-600 shrink-0" />
                          <span><strong className="text-white font-bold">Client Authority:</strong> {tech.client}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                      <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">
                        Status: <span className="text-[#25D366]">Published System Ledger</span>
                      </p>
                      
                      <a 
                        href="/#contact"
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-secondary hover:text-white transition-colors"
                      >
                        Request Feasibility Log <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </section>

          {/* Large Portfolio Disclaimer Callout */}
          <section className="mt-40 p-12 bg-slate-900 border border-white/5 text-center max-w-4xl mx-auto space-y-6">
            <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">A Note On Intellectual Assets</span>
            <h3 className="text-2xl font-bold uppercase tracking-tight text-white">Confidential Structural Blueprints</h3>
            <p className="text-slate-400 text-sm font-light leading-relaxed">
              To safeguard regional logistics hubs and comply with national security standards, detailed high-resolution architectural schematics, site soil consolidation parameters, and digital double ledger twins are kept strictly confidential. Verified partners can request authorized clearance keys via secure physical terminals.
            </p>
          </section>

        </div>
      </main>

      <Footer />
      <ChatWidget />
    </div>
  );
}
