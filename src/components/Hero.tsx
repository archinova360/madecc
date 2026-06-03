import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useContent } from "../context/ContentContext";

import HERO_IMAGE from "../assets/images/modern_bridge_engineering_1778998225640.png";

export default function Hero() {
  const { pageOverrides } = useContent();

  return (
    <section className="relative h-screen flex items-center overflow-hidden bg-slate-950 pt-20">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={HERO_IMAGE}
          alt="MADECC Infrastructure"
          className="w-full h-full object-cover opacity-30 scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        <div className="absolute inset-0 grid-pattern opacity-20" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-4 mb-8">
               <div className="h-px w-12 bg-brand-secondary" />
               <span className="text-brand-secondary text-xs font-black uppercase tracking-[0.4em]">
                 Precision Engineering & Construction
               </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-[76px] font-black tracking-tighter leading-tight mb-10 uppercase">
              {pageOverrides.heroHeading}
            </h1>
            
            <p className="text-slate-400 text-base md:text-lg max-w-2xl mb-12 font-medium leading-relaxed border-l-2 border-brand-secondary/30 pl-8">
              {pageOverrides.heroSubtitle}
            </p>
            
            <div className="flex flex-wrap gap-6">
              <Link
                to="/#portfolio"
                className="group relative bg-brand-secondary text-white px-12 py-6 text-sm font-black uppercase tracking-[0.2em] flex items-center gap-4 shadow-2xl shadow-brand-secondary/20 hover:scale-105 transition-all duration-500"
              >
                View Portfolio
                <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
              </Link>
              <Link
                to="/#about"
                className="px-12 py-6 text-sm font-black uppercase tracking-[0.2em] text-slate-400 border border-white/10 hover:bg-white/5 hover:border-white/30 hover:text-white transition-all duration-300"
              >
                Discover Our Legacy
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats Counter Floating */}
      <div className="absolute bottom-20 left-6 z-20 flex items-center gap-8">
         <div className="flex flex-col">
            <span className="text-4xl font-black font-mono">25+</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Years of excellence</span>
         </div>
         <div className="h-10 w-px bg-white/10" />
         <div className="flex flex-col">
            <span className="text-4xl font-black font-mono">500+</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Global Landmarks</span>
         </div>
      </div>

      {/* Decorative Rail Text */}
      <div className="absolute top-1/2 right-[-240px] -translate-y-1/2 rotate-90 hidden 2xl:block pointer-events-none">
        <span className="text-[200px] font-black text-white/[0.02] whitespace-nowrap leading-none select-none uppercase tracking-tighter">
          Structural Integrity 2026
        </span>
      </div>
    </section>
  );
}
