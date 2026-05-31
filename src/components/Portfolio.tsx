import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus } from "lucide-react";
import { useContent } from "../context/ContentContext";

export default function Portfolio() {
  const { content } = useContent();
  const PROJECTS = content.filter(item => item.type === 'project' && item.status === 'Published');
  const [visibleCount, setVisibleCount] = useState(4);
  const isAllLoaded = visibleCount >= PROJECTS.length;

  const loadMore = () => {
    setVisibleCount(prev => Math.min(prev + 2, PROJECTS.length));
  };

  return (
    <section id="portfolio" className="py-32 bg-slate-900 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
          <div className="max-w-2xl">
            <h2 className="text-5xl md:text-8xl font-black tracking-tighter mb-10 uppercase leading-none">Featured Projects</h2>
            <div className="flex items-center gap-4">
               <div className="w-12 h-[2px] bg-brand-secondary" />
               <p className="text-slate-500 uppercase tracking-[0.3em] text-[10px] font-black">
                 01 / SHOWCASING OUR BEST WORK
               </p>
            </div>
          </div>
          <div className="hidden md:block">
            <p className="text-slate-500 text-sm max-w-xs text-right font-medium leading-relaxed italic border-r border-brand-secondary pl-8">
              Explore our diverse range of engineering marvels and architectural landmarks across the region.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <AnimatePresence>
            {PROJECTS.slice(0, visibleCount).map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="group relative h-[500px] cursor-pointer overflow-hidden border border-white/5"
              >
                <div className="absolute inset-0 overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover grayscale brightness-50 group-hover:grayscale-0 group-hover:brightness-100 group-hover:scale-105 transition-all duration-1000 ease-out"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80" />
                </div>
                
                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-12">
                  <div className="relative z-10">
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] mb-4 block text-brand-secondary">
                      {project.category}
                    </span>
                    <h3 className="text-4xl font-black tracking-tighter mb-6 uppercase group-hover:translate-x-2 transition-transform duration-500">{project.title}</h3>
                    <p className="text-sm text-slate-400 max-w-sm leading-relaxed mb-8 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                      {project.description}
                    </p>
                    <div className="h-[2px] bg-brand-secondary w-12 group-hover:w-full transition-all duration-700" />
                  </div>
                </div>

                {/* ID Tag */}
                <div className="absolute top-8 right-8">
                   <div className="w-16 h-16 bg-slate-950/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-xl font-mono font-black italic">
                      0{project.id}
                   </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {!isAllLoaded && (
          <div className="mt-20 flex justify-center">
            <button 
              onClick={loadMore}
              className="group flex flex-col items-center gap-4 text-xs font-black uppercase tracking-[0.4em] text-slate-500 hover:text-white transition-colors"
            >
              <span>Discover More</span>
              <div className="w-16 h-16 rounded-none border border-white/10 flex items-center justify-center group-hover:bg-brand-secondary group-hover:border-brand-secondary group-hover:text-white transition-all duration-500">
                <Plus size={24} />
              </div>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

