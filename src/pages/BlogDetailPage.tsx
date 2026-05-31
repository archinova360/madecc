import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ChatWidget from "../components/ChatWidget";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Clock, Calendar, Tag, Share2, Check } from "lucide-react";
import { useContent } from "../context/ContentContext";
import { useDocumentSEO } from "../hooks/useDocumentSEO";

export default function BlogDetailPage() {
  const { id } = useParams();
  const { content } = useContent();
  const post = content.find(item => item.id === id);
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Inject dynamic SEO for specific post pages
  useDocumentSEO({
    title: post ? `${post.title} | MADECC Technical Dispatches` : "Technical Dispatch | MADECC Construction",
    description: post ? `${post.seo.caption}. ${post.seo.description}` : "MADECC structural insights and architecture research analysis.",
    keywords: post ? `${post.category.toLowerCase()}, madecc, ${post.title.toLowerCase().replace(/[^a-zA-Z0-9 ]/g, "").split(" ").join(", ")}, civil engineering Cameroon` : "madecc, research, civil engineering",
    ogImage: post ? post.image : undefined
  });

  const handleShare = async () => {
    if (!post || isSharing) return;
    
    setIsSharing(true);
    const shareData = {
      title: post.title,
      text: post.seo.description,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error("Error sharing:", err);
      }
    } finally {
      setIsSharing(false);
    }
  };

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center space-y-6">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter">Artifact Not Found</h1>
        <Link 
          to="/blog" 
          className="px-8 py-3 bg-brand-secondary text-white font-black uppercase tracking-widest text-xs rounded-none hover:bg-white hover:text-brand-secondary transition-all"
        >
          Return to Journal
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-brand-secondary selection:text-white">
      <Navbar />
      
      <main className="pt-48 pb-32">
        <div className="max-w-4xl mx-auto px-6">
          <Link 
            to="/blog" 
            className="inline-flex items-center gap-2 text-slate-500 hover:text-brand-secondary transition-colors mb-12 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Back to Dispatches</span>
          </Link>

          <header className="space-y-8 mb-16">
            <div className="flex items-center gap-4">
              <span className="px-4 py-1.5 bg-brand-secondary/10 border border-brand-secondary/20 text-brand-secondary text-[10px] font-black uppercase tracking-widest">
                {post.category}
              </span>
              <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                <Calendar size={12} />
                {post.date}
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none italic">
              {post.title}
            </h1>

            <p className="text-xl text-slate-400 font-medium leading-relaxed italic border-l-4 border-brand-secondary pl-8 py-2">
              {post.seo.caption}
            </p>
          </header>

          <div className="aspect-video bg-slate-900 border border-white/5 overflow-hidden mb-16">
            <img 
              src={post.image} 
              alt={post.title} 
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
            />
          </div>

          <article className="prose prose-invert prose-slate max-w-none">
            <div className="space-y-8 text-slate-300 leading-relaxed text-lg">
              <p>{post.description || post.seo.description}</p>
              
              <div className="p-12 bg-white/5 border border-white/10 my-16 space-y-4">
                <h4 className="text-brand-secondary font-black uppercase tracking-widest text-xs">Technical Abstract</h4>
                <p className="text-white italic font-medium leading-relaxed">
                  "The evolution of modern engineering requires a synergy between structural integrity and aesthetic audacity. Our research indicates a 40% increase in efficiency when modularity is prioritised over legacy frameworks."
                </p>
              </div>

              <p>
                As we move into the second half of 2024, MADECC remains at the forefront of these transformations. Our commitment to technical excellence is reflected in every artifact we produce.
              </p>
            </div>
          </article>

          <footer className="mt-24 pt-12 border-t border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-secondary rounded-full flex items-center justify-center font-black">M</div>
              <div>
                <p className="text-white font-black uppercase italic text-sm tracking-tighter">MADECC Editorial Board</p>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Structural Analysis Dept.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={handleShare}
                disabled={isSharing}
                className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-brand-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-white/10 text-[10px] font-black uppercase tracking-widest relative overflow-hidden group"
              >
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.div
                      key="check"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <Check size={14} className="text-green-400" />
                      <span>Link Copied</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="share"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <Share2 size={14} />
                      <span>Share Dispatch</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </footer>
        </div>
      </main>

      <Footer />
      <ChatWidget />
    </div>
  );
}
