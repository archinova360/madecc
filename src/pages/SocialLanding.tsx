import { motion } from "motion/react";
import { Instagram, Linkedin, Twitter, MessageCircle, MapPin, Globe, Facebook, ChevronRight, Building2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function SocialLanding() {
  const links = [
    { name: "Official Portal", url: "/", icon: Globe },
    { name: "Facebook (Public Affairs)", url: "https://www.facebook.com/share/1Ayz1EGYj6/", icon: Facebook },
    { name: "Project Showcase (Instagram)", url: "#", icon: Instagram },
    { name: "Industry Relations (LinkedIn)", url: "#", icon: Linkedin },
    { name: "Terminal Updates (X)", url: "#", icon: Twitter },
    { name: "Structural Advisory (WhatsApp)", url: "https://wa.me/237683316486", icon: MessageCircle },
    { name: "Global HQ (Navigation)", url: "https://maps.app.goo.gl/wbHUNHdpcEagX8of9", icon: MapPin },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-10 pointer-events-none" />
      
      <motion.div 
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="mb-16 relative z-10"
      >
        <Link to="/" className="inline-flex items-center gap-4 mb-10 group">
          <div className="w-16 h-16 flex items-center justify-center border-2 border-brand-secondary shadow-lg shadow-brand-secondary/20 bg-slate-900">
             <Building2 size={32} className="text-brand-secondary group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-left">
            <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">MADECC</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-secondary mt-1">Construction Group</p>
          </div>
        </Link>
        <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px] max-w-xs mx-auto">
          Pioneering Structural Innovation <br /> & Future Legacies since 1998
        </p>
      </motion.div>

      <div className="w-full max-w-md space-y-4 relative z-10">
        {links.map((link, index) => {
          const isInternal = link.url.startsWith('/');

          return (
            <motion.div
              key={link.name}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              {isInternal ? (
                <Link
                  to={link.url}
                  className="flex items-center justify-between w-full p-6 bg-slate-900/50 backdrop-blur-md border border-white/5 hover:border-brand-secondary/50 hover:bg-slate-900 transition-all group overflow-hidden relative"
                >
                  <div className="absolute left-0 top-0 w-[2px] h-0 bg-brand-secondary group-hover:h-full transition-all duration-500" />
                  <div className="flex items-center gap-6">
                    <link.icon size={22} className="text-slate-500 group-hover:text-brand-secondary transition-colors" />
                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">{link.name}</span>
                  </div>
                  <ChevronRight size={18} className="text-slate-700 group-hover:text-brand-secondary group-hover:translate-x-1 transition-all" />
                </Link>
              ) : (
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between w-full p-6 bg-slate-900/50 backdrop-blur-md border border-white/5 hover:border-brand-secondary/50 hover:bg-slate-900 transition-all group overflow-hidden relative"
                >
                  <div className="absolute left-0 top-0 w-[2px] h-0 bg-brand-secondary group-hover:h-full transition-all duration-500" />
                  <div className="flex items-center gap-6">
                    <link.icon size={22} className="text-slate-500 group-hover:text-brand-secondary transition-colors" />
                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">{link.name}</span>
                  </div>
                  <ChevronRight size={18} className="text-slate-700 group-hover:text-brand-secondary group-hover:translate-x-1 transition-all" />
                </a>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="mt-24 relative z-10">
         <p className="text-slate-700 text-[10px] font-black uppercase tracking-[0.5em]">&copy; 2026 MADECC Construction Group</p>
         <div className="mt-6 flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] uppercase font-bold text-slate-700 tracking-widest">Protocol Active</span>
         </div>
      </div>
    </div>
  );
}

