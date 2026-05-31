import { motion } from "motion/react";
import { ArrowRight, History, Target, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

export default function AboutSection() {
  return (
    <section id="about" className="py-32 bg-slate-900 overflow-hidden relative">
      <div className="absolute inset-0 grid-pattern opacity-10 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="relative">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="relative z-10"
            >
              <img
                src="/src/assets/images/construction_site_team_1778998257322.png"
                alt="MADECC Construction Site Team"
                className="w-full aspect-[4/5] object-cover grayscale brightness-75 border border-white/5"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-12 -right-12 w-72 h-72 bg-brand-secondary hidden md:flex flex-col items-center justify-center p-10 text-white shadow-2xl shadow-brand-secondary/40">
                  <span className="text-xs font-black uppercase tracking-[0.3em] opacity-80 mb-2">Since 1998</span>
                  <p className="text-7xl font-black font-mono leading-none mb-4">25+</p>
                  <p className="text-[10px] text-center uppercase font-black tracking-widest leading-relaxed">
                    Years of Structural Excellence in the Industry
                  </p>
                  <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-white/50" />
                  <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-white/50" />
              </div>
            </motion.div>
            <div className="absolute -top-12 -left-12 w-full h-full border border-brand-secondary/10 -z-0" />
          </div>

          <div>
            <div className="inline-flex items-center gap-3 mb-6">
               <div className="w-8 h-[2px] bg-brand-secondary" />
               <span className="text-brand-secondary font-black uppercase tracking-[0.4em] text-[10px]">About MADECC</span>
            </div>
            
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-10 uppercase leading-[0.85]">
              Engineering the <br /> 
              <span className="text-brand-secondary italic lowercase opacity-90">extraordinary</span>.
            </h2>
            
            <div className="space-y-6 text-slate-400 text-lg leading-relaxed mb-12 font-light">
              <p className="border-l border-brand-secondary/20 pl-6">
                Founded on the principles of precision and integrity, MADECC Construction has grown from a regional contractor into a powerhouse of modern engineering.
              </p>
              
              <div className="grid grid-cols-1 gap-6 pt-6">
                <div className="flex gap-4 items-start">
                  <div className="p-2 bg-brand-secondary/10 text-brand-secondary rounded-md shrink-0">
                    <History size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Our History</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">Established 1998 in Yaoundé, evolving from a foundations expert into a leading Central African general contractor.</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="p-2 bg-brand-secondary/10 text-brand-secondary rounded-md shrink-0">
                    <Target size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Clear Mission</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">To design & engineer high-integrity structural landmarks that redefine durability and empower modern living.</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="p-2 bg-brand-secondary/10 text-brand-secondary rounded-md shrink-0">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Core Values</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">Safety, millimeter-accuracy, uncompromising integrity, and eco-conscious sustainability in everything we construct.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <Link to="/about" className="group inline-flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.4em] text-white hover:text-brand-secondary transition-all">
              Read Our Full Story
              <ArrowRight size={20} className="group-hover:translate-x-3 transition-transform text-brand-secondary" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
