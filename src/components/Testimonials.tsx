import { motion } from "motion/react";
import { Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Jonathan Wright",
    role: "Director, Urban Dev Corp",
    content: "MADECC didn't just build our headquarters; they built a statement. Their attention to structural integrity and aesthetic detail is unmatched in the modern era.",
    avatar: "https://i.pravatar.cc/150?u=1"
  },
  {
    name: "Sarah Chen",
    role: "Chief Architect, ArcDesign",
    content: "Collaborating with MADECC on the Skyline project was seamless. They understand architectural vision and possess the technical prowess to execute complex geometries.",
    avatar: "https://i.pravatar.cc/150?u=2"
  },
  {
    name: "Marcus Thorne",
    role: "Gov. Infrastructure Lead",
    content: "Reliability is the cornerstone of our partnership. MADECC delivers on time, under budget, and with a level of precision that sets a new industry standard.",
    avatar: "https://i.pravatar.cc/150?u=3"
  }
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-32 bg-slate-950 overflow-hidden relative">
      <div className="absolute inset-0 grid-pattern opacity-5" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-32">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-12 h-[px] bg-brand-secondary" />
            <span className="text-brand-secondary font-black uppercase tracking-[0.4em] text-[10px]">Client Feedback</span>
            <div className="w-12 h-[px] bg-brand-secondary" />
          </div>
          <h2 className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-none">Partners in Precision</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="bg-slate-900/50 backdrop-blur-md p-12 relative border border-white/5 hover:border-brand-secondary/30 transition-all group"
            >
              <Quote size={40} className="text-brand-secondary opacity-20 absolute top-8 right-8" />
              <p className="text-slate-300 mb-10 leading-relaxed italic text-lg relative z-10">
                "{t.content}"
              </p>
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 border border-brand-secondary/20 p-1 flex items-center justify-center">
                   <div className="w-full h-full overflow-hidden grayscale brightness-125 group-hover:grayscale-0 group-hover:brightness-100 transition-all">
                      <img src={t.avatar} alt={t.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                   </div>
                </div>
                <div>
                  <h4 className="font-black text-xs tracking-[0.1em] text-white uppercase mb-1">{t.name}</h4>
                  <p className="text-[10px] text-brand-secondary font-black uppercase tracking-widest">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Logo Strip Placeholder */}
        <div className="mt-40 border-t border-white/5 pt-20">
          <p className="text-center text-[10px] font-black uppercase tracking-[0.5em] text-slate-600 mb-16">Global Alliance Network</p>
          <div className="flex flex-wrap justify-center items-center gap-x-20 gap-y-12 opacity-20 hover:opacity-50 transition-opacity">
             {['CORP', 'ARCH', 'CITY', 'METRO', 'ENG'].map(l => (
               <span key={l} className="text-4xl font-black tracking-[0.3em] font-display">{l}</span>
             ))}
          </div>
        </div>
      </div>
    </section>
  );
}
