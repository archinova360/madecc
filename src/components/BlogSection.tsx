import { motion } from "motion/react";
import { useContent } from "../context/ContentContext";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function BlogSection() {
  const { content } = useContent();
  const POSTS = content.filter(item => item.type === 'insight' && item.status === 'Published');

  return (
    <section id="blog" className="py-32 bg-slate-900 relative">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8">
          <div>
            <div className="flex items-center gap-4 mb-4">
               <div className="w-12 h-[2px] bg-brand-secondary" />
               <span className="text-brand-secondary font-black uppercase tracking-[0.4em] text-[10px]">Knowledge Base</span>
            </div>
            <h2 className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-[0.8]">Insights <br /> & News</h2>
          </div>
          <Link to="/blog" className="group flex items-center gap-4 text-xs font-black uppercase tracking-[0.4em] text-white hover:text-brand-secondary transition-all mb-4">
            View All
            <ArrowRight size={18} className="translate-y-[-1px] group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {POSTS.map((post, index) => (
            <motion.article
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group cursor-pointer"
            >
              <div className="aspect-[4/3] overflow-hidden mb-10 relative border border-white/5">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-0 left-0 bg-brand-secondary text-white text-[10px] font-black uppercase tracking-[0.3em] px-6 py-3">
                  {post.category}
                </div>
              </div>
              <div className="flex items-center gap-4 mb-4">
                 <div className="w-1 h-4 bg-brand-secondary/30" />
                 <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">{post.date}</p>
              </div>
              <h3 className="text-2xl font-black tracking-tighter group-hover:text-brand-secondary transition-colors uppercase leading-tight">
                <Link to="/blog">{post.title}</Link>
              </h3>
              <p className="mt-4 text-slate-500 text-sm italic font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Discover the engineering behind the breakthrough...
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
