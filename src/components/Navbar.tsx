import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Building2, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "About", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Portfolio", href: "/portfolio" },
    { name: "Journal", href: "/blog" },
    { name: "Contact", href: "/#contact" },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#0F172A]/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-6 group">
          <div className="relative group/logo">
             <img src="/logo.png" alt="MADECC Logo" className="h-14 w-auto object-contain transition-transform duration-500 group-hover/logo:scale-110" />
             <div className="absolute -top-1 -left-1 w-2 h-2 bg-brand-secondary opacity-0 group-hover/logo:opacity-100 transition-opacity" />
          </div>
          <div className="flex flex-col border-l border-white/10 pl-5">
            <span className="text-2xl font-black tracking-tighter uppercase leading-none text-white">MADECC</span>
            <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-brand-secondary leading-none mt-1">Construction Group</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-12">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400 hover:text-white transition-all hover:translate-y-[-1px]"
            >
              {link.name}
            </Link>
          ))}
          <Link
            to="/#contact"
            className="group relative px-6 py-2 overflow-hidden border border-brand-secondary text-brand-secondary hover:text-white transition-colors duration-300"
          >
            <span className="relative z-10 text-[10px] font-black uppercase tracking-widest">Connect</span>
            <div className="absolute inset-0 bg-brand-secondary translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden absolute top-24 left-0 w-full bg-slate-900 border-b border-white/5 p-8 flex flex-col gap-8 shadow-2xl"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-lg font-black uppercase tracking-[0.3em] text-slate-400 hover:text-brand-secondary transition-all"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/#contact"
              onClick={() => setIsOpen(false)}
              className="bg-brand-secondary text-white text-center py-4 text-xs font-black uppercase tracking-widest shadow-xl shadow-brand-secondary/20"
            >
              Start a Project
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
