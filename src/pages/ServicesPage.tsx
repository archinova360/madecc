import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ChatWidget from "../components/ChatWidget";
import { motion } from "motion/react";
import { 
  Ruler, 
  Building, 
  HardHat, 
  ShieldCheck, 
  Truck, 
  Drill, 
  Layers, 
  Cpu, 
  Lightbulb, 
  Gauge 
} from "lucide-react";
import { useDocumentSEO } from "../hooks/useDocumentSEO";

export default function ServicesPage() {
  useDocumentSEO({
    title: "Engineering & Construction Services | MADECC Group Cameroon",
    description: "Explore our master engineering capabilities: Civil Infrastructure, General Construction, Brutalist Industrial Design, Millimeter-Precision Material Sourcing, and OSHA Safety Certified Project Delivery.",
    keywords: "MADECC construction services, Civil Engineering Yaounde, Commercial builder Douala, Industrial steel structures Cameroon, Project management, warehouse layout, bridge design"
  });

  const detailedServices = [
    {
      icon: <Ruler className="text-brand-secondary" size={36} />,
      title: "Civil Engineering & Hydrostructural Works",
      tagline: "Horizontal Infrastructure of Genarational Force",
      description: "MADECC Group engineers regional highways, critical suspension bridges, and dynamic stormwater drainage networks that withstand tropical downpours and torrential equatorial rain. We combine advanced soil consolidation physics, geospatial analysis, and regional material durability indexes to structure logistics backbones connecting Cameroon's economic hubs.",
      metrics: "Structural Class: S-1 High Tension | Subgrade Compaction Tolerance: < 2.5mm | Tropical Drainage Gradient: High Velocity Drainage Profiles"
    },
    {
      icon: <Building className="text-brand-secondary" size={36} />,
      title: "General Vertical Construction",
      tagline: "Precision Tower Frames & Structural Steel",
      description: "From mid-rise corporate offices in Douala to commercial towers and high-end residential estates in Yaoundé, we provide general contracting services that turn architectural visions into concrete realities. Our vertical divisions enforce millimeter core tolerances, high-yield rebar frameworks, and modern thermal mass insulation values to establish carbon-neutral structural centers.",
      metrics: "Core Framing: Pre-Stressed Cast-in-Place Concrete | Average Lifespan Index: 120 Years | Thermal Energy Savings: Up to 45% Passive Reduction"
    },
    {
      icon: <HardHat className="text-brand-secondary" size={36} />,
      title: "Brutalist & Industrial Design",
      tagline: "Raw Concrete Brilliance and Operational Architecture",
      description: "Repurposing Brutalist layout philosophies—characterized by exposed raw structural concrete, geometric audacity, and pure functional truth—we specialize in multi-acre warehousing, cold chain logistics nodes, and heavy industrial facilities. These workspaces combine aesthetic audacity with heavy-machinery maneuverability and scalable loading solutions.",
      metrics: "Aesthetic Class: Structural Honesty / Exposed Concrete | Load-Deflection Capacity: 15 Tonnes/m² | Acoustic Insulation: Dual Layer Sub-Slab Buffering"
    },
    {
      icon: <ShieldCheck className="text-brand-secondary" size={36} />,
      title: "OSHA-Compliant Project Management",
      tagline: "Unified Structural Governance & Site Digital Twins",
      description: "Our project managers coordinate complex lifecycles with transparent material audit trails, digital twin simulations, and active worker-protection monitoring. By combining cloud ledger calculations with strict scheduling milestones, we reduce lead times while holding a zero-incident safety record across high-risk altitude sites.",
      metrics: "Safety Standard: OSHA 'Project 2026' Benchmark | Lead-Time Variance: -40% Lifecycle Savings | Site Sync Rate: Real-Time Biometric Monitoring"
    },
    {
      icon: <Truck className="text-brand-secondary" size={36} />,
      title: "Logistics, Supply & Material Sourcing",
      tagline: " millimetric Sourcing for High-Duty Operations",
      description: "We deploy premium heavy cranes, crawler excavators, and dumpers across deep-forested log channels or active urban centres. Leveraging direct volume partnerships with domestic cement kilns and international steel mills, we distribute certified CPJ-35/CPJ-45 cements, fine volcanic aggregates, and high-tensile structural steel grid structures.",
      metrics: "Transport Fleet: Dual-Axle Tipper & Crane Squads | Cement Standards: CPJ-35 / CPJ-45 Certified | Regional Supply Coverage: 100% Cameroon Coverage"
    },
    {
      icon: <Drill className="text-brand-secondary" size={36} />,
      title: "Structural Rehabilitation, Retrofit & Repair",
      tagline: "Reinforcing Legacy Infrastructure for Modern Service",
      description: "Aging structures undergo massive strength degradation due to weather corrosion and soil micro-shifts. MADECC retrofits masonry columns, stabilizes deep structural foundations with carbon-fiber wraps, re-calculates load thresholds, and modernizes thermal ratings while preserving critical aesthetic heritage.",
      metrics: "Remediation Core: Carbon-Fiber Structural Wrapping | Foundation Grouting: High-Pressure Polyurethane | Vibration Deflection: Up to 85% Restructuring"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-brand-secondary selection:text-white">
      <Navbar />
      
      <main className="pt-48 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Header */}
          <header className="mb-32 relative">
            <div className="absolute -top-10 left-0 w-24 h-[1px] bg-brand-secondary" />
            <span className="text-brand-secondary font-black uppercase tracking-[0.4em] text-[10px] block mb-4">
              MADECC Technical Capabilities
            </span>
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter uppercase mb-6 leading-none">
              OUR <br />
              EXPERTISE
            </h1>
            <p className="text-slate-500 uppercase tracking-[0.4em] font-black text-xs border-l border-brand-secondary/30 pl-6 max-w-2xl">
              Millimeter-precision engineering and structural integrity solutions formulated to persist against tropical elements and generational forces.
            </p>
          </header>

          {/* Division Introductions */}
          <section className="mb-32 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white italic leading-none">
                Structural Powerhouse of <span className="text-brand-secondary">Central Africa</span>
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed font-light">
                Since 1998, MADECC has built the physical foundations that support business expansion and public-sector logistics across Cameroon. Our specialized divisions bridge the gap between architectural art and engineering physics, implementing rigorous material auditories and structural security digital twins.
              </p>
              <div className="grid grid-cols-2 gap-6 pt-6">
                <div className="bg-slate-900 border border-white/5 p-6 rounded">
                  <span className="text-3xl font-black font-mono text-brand-secondary">100%</span>
                  <p className="text-[10px] uppercase text-slate-500 font-bold mt-1">OSHA Safety Rating</p>
                </div>
                <div className="bg-slate-900 border border-white/5 p-6 rounded">
                  <span className="text-3xl font-black font-mono text-brand-secondary">&lt; 1mm</span>
                  <p className="text-[10px] uppercase text-slate-500 font-bold mt-1">Tolerance Margin</p>
                </div>
              </div>
            </div>
            
            <div className="relative border border-white/5 p-2 bg-slate-900">
              <img 
                src="https://images.unsplash.com/photo-1541888946425-d81bb19480c5?auto=format&fit=crop&q=80&w=2070" 
                alt="Construction Concrete Splicing" 
                className="w-full h-80 object-cover grayscale brightness-75 hover:grayscale-0 transition-all duration-700"
              />
            </div>
          </section>

          {/* Services Stacked Grid */}
          <section className="space-y-16">
            <div className="border-b border-white/10 pb-4">
              <h3 className="text-2xl font-black uppercase tracking-tight text-brand-secondary">Comprehensive Construction Portfolio</h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {detailedServices.map((service, index) => (
                <div 
                  key={index}
                  className="bg-slate-900 border border-white/5 p-12 hover:border-brand-secondary/30 transition-all duration-500 relative flex flex-col justify-between group"
                >
                  <div className="space-y-6">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-slate-950 flex items-center justify-center border border-white/5 group-hover:border-brand-secondary/50 transition-colors">
                        {service.icon}
                      </div>
                      <div>
                        <span className="text-[9px] font-mono font-black text-brand-secondary tracking-widest uppercase block mb-1">CAPABILITY 0{index + 1}</span>
                        <h4 className="text-2xl font-black uppercase tracking-tight text-white leading-none">
                          {service.title}
                        </h4>
                      </div>
                    </div>
                    
                    <p className="text-xs uppercase tracking-widest text-[#25D366] font-bold italic">
                      {service.tagline}
                    </p>
                    
                    <p className="text-slate-400 text-sm leading-relaxed font-light">
                      {service.description}
                    </p>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/5 space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Technical Scope & Tolerances:</p>
                    <p className="text-xs font-mono text-zinc-300 leading-normal bg-slate-950/40 p-3 border border-white/5 rounded">
                      {service.metrics}
                    </p>
                  </div>
                  
                  <div className="absolute inset-x-0 bottom-0 h-[2px] bg-brand-secondary scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />
                </div>
              ))}
            </div>
          </section>

          {/* Connect Action Card */}
          <section className="mt-32 p-16 bg-white/5 border border-white/5 text-center space-y-6 relative overflow-hidden">
            <div className="absolute inset-0 grid-pattern opacity-5" />
            <div className="relative z-10 max-w-xl mx-auto space-y-6">
              <h3 className="text-3xl font-black uppercase tracking-tight">Need a customized engineering study?</h3>
              <p className="text-slate-400 text-sm font-light">
                Calculate site-specific budget estimations using our virtual cost tool, or connect directly to schedule visual soil assessments and structural briefings.
              </p>
              <div className="pt-6">
                <a
                  href="/#contact"
                  className="px-10 py-5 bg-brand-secondary text-white font-black uppercase tracking-widest text-xs hover:bg-white hover:text-brand-secondary transition-all inline-block"
                >
                  Initiate Pre-Design Scoping
                </a>
              </div>
            </div>
          </section>

        </div>
      </main>

      <Footer />
      <ChatWidget />
    </div>
  );
}
