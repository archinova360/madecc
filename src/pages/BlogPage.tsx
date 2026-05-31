import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ChatWidget from "../components/ChatWidget";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useContent } from "../context/ContentContext";
import Newsletter from "../components/Newsletter";
import { useDocumentSEO } from "../hooks/useDocumentSEO";

export default function BlogPage() {
  useDocumentSEO({
    title: "Technical Journal & Industry Insights | MADECC Construction",
    description: "Read high-quality articles and engineering dispatches from MADECC Construction: exploring tropical building codes, modular real estate engineering, raw Brutalist logistics hubs, and safety operations.",
    keywords: "MADECC construction blog, engineering journal, modular architecture research, construction safety news, concrete design articles Cameroon"
  });

  const { content } = useContent();
  const posts = content.filter(item => item.type === 'insight' && item.status === 'Published');

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-brand-secondary selection:text-white">
      <Navbar />
      <main className="pt-48 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <header className="mb-32 relative">
            <div className="absolute -top-10 left-0 w-24 h-[1px] bg-brand-secondary" />
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter uppercase mb-6 leading-none">THE <br /> JOURNAL</h1>
            <p className="text-slate-500 uppercase tracking-[0.4em] font-black text-xs border-l border-brand-secondary/30 pl-6">Technical Dispatches on Engineering Excellence.</p>
          </header>

          <div className="grid grid-cols-1 gap-px bg-white/5 border border-white/5">
            {posts.map((post, index) => (
              <Link 
                to={`/blog/${post.id}`} 
                key={post.id}
              >
                <motion.div 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="bg-slate-900 p-16 flex flex-col md:flex-row justify-between items-center group hover:bg-slate-800 transition-all duration-500 relative overflow-hidden"
                >
                  <div className="flex gap-16 items-center w-full">
                     <span className="text-6xl font-mono font-black italic text-slate-800 group-hover:text-brand-secondary/20 transition-colors">0{index + 1}</span>
                     <div className="flex-1">
                       <div className="flex items-center gap-4 mb-3">
                          <div className="w-6 h-[1px] bg-brand-secondary/50 group-hover:w-10 transition-all" />
                          <span className="text-brand-secondary text-[10px] font-black uppercase tracking-[0.3em]">{post.category}</span>
                          <span className="text-slate-600 text-[10px] uppercase font-bold tracking-widest ml-auto">{post.date}</span>
                       </div>
                       <h2 className="text-3xl md:text-5xl font-black tracking-tighter group-hover:translate-x-4 transition-transform duration-500 uppercase leading-none">{post.title}</h2>
                     </div>
                  </div>
                  <div className="mt-12 md:mt-0 md:ml-12 opacity-30 group-hover:opacity-100 transition-all group-hover:translate-x-2">
                     <div className="w-20 h-20 rounded-none border border-white/10 flex items-center justify-center text-white group-hover:border-brand-secondary group-hover:bg-brand-secondary transition-all">
                        <ArrowRight size={32} />
                     </div>
                  </div>
                  <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-brand-secondary group-hover:w-full transition-all duration-700" />
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
        <Newsletter />
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
