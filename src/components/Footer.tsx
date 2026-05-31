import { Link } from "react-router-dom";
import { Building2 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-white pt-32 pb-16 relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-5 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-20 mb-32">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-6 group mb-10">
              <div className="relative group/logo">
                <img src="/logo.png" alt="MADECC Logo" className="h-16 w-auto object-contain transition-transform duration-500 group-hover/logo:scale-110" />
              </div>
              <div className="flex flex-col border-l border-white/10 pl-6">
                <span className="text-4xl font-black tracking-tighter uppercase leading-none">MADECC</span>
                <span className="text-[12px] font-bold uppercase tracking-[0.4em] text-brand-secondary leading-none mt-2">Construction Group</span>
              </div>
            </Link>
            <p className="text-slate-400 text-xl font-light leading-relaxed max-w-md italic border-l border-brand-secondary/30 pl-8 mb-12">
              Pioneering architectural boundaries and engineering innovation since 1998. Building the infrastructure of tomorrow with today's smartest solutions.
            </p>
            <div className="flex items-center gap-10">
               <div className="flex flex-col">
                  <span className="text-sm font-black uppercase tracking-widest mb-1">Systems</span>
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                     <span className="text-[10px] uppercase font-bold text-slate-500">Operational</span>
                  </div>
               </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.4em] text-brand-secondary mb-10">Navigation</h4>
            <ul className="space-y-6">
              {['About Us', 'Services', 'Portfolio', 'Journal', 'FAQ', 'Contact'].map(link => (
                <li key={link}>
                  <Link 
                    to={link === 'Journal' ? '/blog' : link === 'About Us' ? '/about' : link === 'FAQ' ? '/#faq' : `/#${link.toLowerCase()}`}
                    className="text-sm font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-all flex items-center gap-3 group"
                  >
                    <div className="w-0 h-[1px] bg-brand-secondary group-hover:w-4 transition-all" />
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.4em] text-brand-secondary mb-10">Ethics & Legal</h4>
            <ul className="space-y-6">
              {[
                { name: 'Privacy Policy', path: '/privacy' },
                { name: 'Cookie Policy', path: '/cookies' },
                { name: 'Terms of Service', path: '/terms' },
                { name: 'Admin Portal', path: '/admin' }
              ].map(link => (
                <li key={link.name}>
                  <Link 
                    to={link.path}
                    className="text-sm font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-all flex items-center gap-3 group"
                  >
                    <div className="w-0 h-[1px] bg-brand-secondary group-hover:w-4 transition-all" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">
            © 2026 MADECC Construction Group. All rights reserved.
          </p>
          <div className="flex items-center gap-10">
             <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-secondary transition-colors">Instagram</a>
             <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-secondary transition-colors">LinkedIn</a>
             <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-secondary transition-colors">X / Twitter</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
