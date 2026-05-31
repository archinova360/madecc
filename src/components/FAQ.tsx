import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus, HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: "What engineering solutions do you offer for tropical climates?",
    answer: "MADECC specializes in high-thermal-mass materials and passive cooling systems. Our designs utilize natural ventilation corridors and structural shading to reduce energy consumption in equatorial projects by up to 45% compared to traditional builds.",
    keywords: "Tropical engineering, passive cooling systems, thermal regulation, sustainable construction."
  },
  {
    question: "How does modular construction reduce project timelines?",
    answer: "By utilizing factory-controlled fabrication, we move over 70% of the assembly process off-site. This parallel workflow allows for foundation work and structural assembly to occur simultaneously, shortening the total project lifecycle by approximately 40%.",
    keywords: "Modular construction, prefabricated structural components, construction efficiency, accelerated project delivery."
  },
  {
    question: "Is MADECC fully compliant with 2026 OSHA safety standards?",
    answer: "Yes. Our structural integrity protocols already exceed 'Project 2026' safety benchmarks. We integrate real-time biometric site monitoring and digital twin risk assessments to maintain a zero-incident record across all high-altitude work zones.",
    keywords: "OSHA compliance 2026, construction site safety, structural safety protocols, risk assessment AI."
  },
  {
    question: "Can I manage payments and invoices through the MADECC platform?",
    answer: "Absolutely. Our central administrative ledger allows clients to track project milestones, download verified tax-ready receipts, and execute secure payments for structural dispatches through a centralized, encrypted portal.",
    keywords: "Construction payment management, digital invoicing, structural ledger, project milestone tracking."
  },
  {
    question: "What is the cultural philosophy behind MADECC infrastructure?",
    answer: "We view infrastructure as 'Intellectual Capital.' Our philosophy, 'Infrastructure as Art,' dictates that every bridge, dam, or warehouse should serve a cultural purpose, demonstrating structural honesty and aesthetic audacity in every joint and beam.",
    keywords: "Engineering philosophy, architectural aesthetics, structural honesty, civil works as art."
  },
  {
    question: "Do you provide consultancy for Brutalist industrial design?",
    answer: "Yes. We specialize in repurposing Brutalist principles—raw concrete, geometric honesty, and structural clarity—for modern warehousing and logistics hubs, creating spaces that are both operationally efficient and architecturally profound.",
    keywords: "Brutalist architecture, industrial design consultancy, raw concrete structural works, logistics hub design."
  }
];

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Generate JSON-LD for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <section id="faq" className="py-32 bg-slate-950 relative overflow-hidden">
      {/* SEO Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="w-16 h-16 bg-brand-secondary/10 border border-brand-secondary/20 rounded-2xl flex items-center justify-center mx-auto mb-8 text-brand-secondary"
          >
            <HelpCircle size={32} />
          </motion.div>
          <h2 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter mb-6 leading-none">
            Structural <br />
            <span className="text-brand-secondary">Inquiries</span>
          </h2>
          <p className="text-slate-500 text-xs font-black uppercase tracking-[0.3em] max-w-md mx-auto">
            Technical clarity and project protocol FAQs.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <button
                onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                className={`w-full text-left p-8 transition-all duration-300 border border-white/5 relative overflow-hidden ${
                  activeIndex === index 
                    ? 'bg-white/5 border-brand-secondary/30' 
                    : 'bg-slate-900/50 hover:bg-slate-900 hover:border-white/10'
                }`}
              >
                <div className="flex justify-between items-center gap-6">
                  <div className="flex items-center gap-4">
                    <span className="text-brand-secondary font-mono text-[10px] font-black opacity-50">
                      Q_{index + 1}
                    </span>
                    <h3 className="text-lg md:text-xl font-bold text-white uppercase italic tracking-tight leading-tight">
                      {faq.question}
                    </h3>
                  </div>
                  <div className={`shrink-0 transition-transform duration-300 ${activeIndex === index ? 'rotate-180' : ''}`}>
                    {activeIndex === index ? (
                      <Minus size={20} className="text-brand-secondary" />
                    ) : (
                      <Plus size={20} className="text-slate-500 group-hover:text-white" />
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {activeIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0, marginTop: 0 }}
                      animate={{ height: 'auto', opacity: 1, marginTop: 24 }}
                      exit={{ height: 0, opacity: 0, marginTop: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-6 border-t border-white/5 space-y-4">
                        <p className="text-slate-300 leading-relaxed text-sm italic font-medium italic">
                          {faq.answer}
                        </p>
                        <div className="pt-4">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                            Technical Scope: <span className="text-slate-400">{faq.keywords}</span>
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Progress highlight for active */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 bg-brand-secondary transition-all duration-500 ${activeIndex === index ? 'opacity-100' : 'opacity-0'}`} />
              </button>
            </motion.div>
          ))}
        </div>

        <div className="mt-24 p-12 bg-white/5 border border-white/5 text-center space-y-6">
          <p className="text-slate-400 text-sm italic font-medium">
            Could not find the technical specification you were looking for?
          </p>
          <a
            href="#contact"
            className="inline-block px-10 py-4 bg-brand-secondary text-white font-black uppercase tracking-widest text-xs hover:bg-white hover:text-brand-secondary transition-all"
          >
            Initiate Direct Dispatch
          </a>
        </div>
      </div>
    </section>
  );
}
