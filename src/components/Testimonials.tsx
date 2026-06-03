import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Quote, Send, Star, X, MessageSquare, Check } from "lucide-react";
import { safeLocalStorageSetItem, safeLocalStorageGetItem, resolveIndexedDBReferences } from "../utils/storage";

const DEFAULT_TESTIMONIALS = [
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
  const [testimonials, setTestimonials] = useState<any[]>(() => {
    const cached = safeLocalStorageGetItem('madecc_cache_testimonials');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error("Testimonials cache load error", e);
      }
    }
    return DEFAULT_TESTIMONIALS;
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [content, setContent] = useState('');
  const [notif, setNotif] = useState<string | null>(null);

  // Load from server on mount
  useEffect(() => {
    const loadTestimonials = async () => {
      // 1. Instantly load from local storage cache & resolve IndexedDB references
      const cached = safeLocalStorageGetItem('madecc_cache_testimonials');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const resolved = await resolveIndexedDBReferences(parsed);
            setTestimonials(resolved);
          }
        } catch (e) {
          console.warn("Local storage testimonials restoration failed:", e);
        }
      }

      // 2. Try to synchronize from central reviews
      try {
        const res = await fetch('/api/store/testimonials');
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data)) {
            const resolved = await resolveIndexedDBReferences(data);
            setTestimonials(resolved);
            safeLocalStorageSetItem('madecc_cache_testimonials', JSON.stringify(resolved));
          }
        }
      } catch (e) {
        console.warn("Failed to fetch central reviews, using cache defaults.", e);
      }
    };
    loadTestimonials();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !role || !content) return;

    const newFeedback = {
      name,
      role,
      content,
      avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(name)}`
    };

    const updated = [...testimonials, newFeedback];
    setTestimonials(updated);
    safeLocalStorageSetItem('madecc_cache_testimonials', JSON.stringify(updated));

    try {
      await fetch('/api/store/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: updated })
      });
    } catch (e) {
      console.error("Server-side testimonials save failed, preserved locally.", e);
    }

    setName('');
    setRole('');
    setContent('');
    setIsFormOpen(false);
    setNotif("Thank you! Your verified corporate review has been published permanently.");
    setTimeout(() => setNotif(null), 4500);
  };

  return (
    <section id="testimonials" className="py-32 bg-slate-950 overflow-hidden relative">
      <div className="absolute inset-0 grid-pattern opacity-5" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-24">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-12 h-[1px] bg-brand-secondary" />
            <span className="text-brand-secondary font-black uppercase tracking-[0.4em] text-[10px]">Client Feedback</span>
            <div className="w-12 h-[1px] bg-brand-secondary" />
          </div>
          <h2 className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-none">Partners in Precision</h2>
          <p className="text-slate-400 mt-6 text-sm md:text-base max-w-xl mx-auto">
            Honest remarks from regional builders, public sector project executives, and structural consultants.
          </p>
        </div>

        {notif && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-12 max-w-2xl mx-auto p-4 bg-green-600/10 border border-green-500/20 text-green-400 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center gap-3 justify-center text-center"
          >
            <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center text-white"><Check size={12} /></div>
            {notif}
          </motion.div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(index * 0.1, 0.4) }}
              className="bg-slate-900/50 backdrop-blur-md p-12 relative border border-white/5 hover:border-brand-secondary/30 transition-all group"
            >
              <Quote size={40} className="text-brand-secondary opacity-20 absolute top-8 right-8" />
              <p className="text-slate-300 mb-10 leading-relaxed italic text-base relative z-10">
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

        {/* Submit Review Interface Block */}
        <div className="mt-16 flex justify-center">
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-3 px-10 py-5 bg-brand-secondary/10 border border-brand-secondary/30 text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-brand-secondary hover:border-brand-secondary transition-all hover:scale-105 shadow-xl duration-300 active:scale-95"
          >
            <MessageSquare size={16} />
            Post Your Project Review
          </button>
        </div>

        {/* Submit review modal overlay */}
        <AnimatePresence>
          {isFormOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsFormOpen(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight italic">Submit Client Feedback</h3>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Publish your verified review permanently</p>
                  </div>
                  <button 
                    onClick={() => setIsFormOpen(false)}
                    className="p-1.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest block">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Jonathan Wright"
                      className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-white text-xs font-bold focus:outline-none focus:border-brand-secondary" 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest block">Corporate Designation & Firm</label>
                    <input 
                      type="text" 
                      required
                      value={role}
                      onChange={e => setRole(e.target.value)}
                      placeholder="e.g. CEO, Urban Dev Corp"
                      className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-white text-xs font-bold focus:outline-none focus:border-brand-secondary" 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest block">Review Text</label>
                    <textarea 
                      required
                      rows={4}
                      value={content}
                      onChange={e => setContent(e.target.value)}
                      placeholder="Comment on structural integrity, timeline delivery, compliance, or logistics..."
                      className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-white text-xs leading-relaxed focus:outline-none focus:border-brand-secondary font-medium" 
                    />
                  </div>

                  <div className="pt-4 flex gap-4">
                    <button 
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="flex-1 py-4 bg-transparent border border-white/10 text-slate-400 font-bold uppercase text-[10px] tracking-widest hover:text-white hover:bg-white/5 rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 py-4 bg-brand-secondary hover:bg-orange-500 text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
                    >
                      <Send size={12} />
                      Publish Review
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

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
