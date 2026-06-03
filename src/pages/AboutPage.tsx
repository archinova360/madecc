import { motion } from "motion/react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ChatWidget from "../components/ChatWidget";
import { 
  Target, 
  Compass, 
  ShieldCheck, 
  Cpu, 
  Leaf, 
  History, 
  Users, 
  CheckCircle,
  Gem,
  Award
} from "lucide-react";
import { useDocumentSEO } from "../hooks/useDocumentSEO";
import { useContent } from "../context/ContentContext";

export default function AboutPage() {
  const { pageOverrides } = useContent();

  useDocumentSEO({
    title: "About Us | MADECC Construction Group Cameroon",
    description: "Learn about MADECC Construction Group: our historical milestones since 1998 in Yaoundé, uncompromising integrity core values, certified construction safety directors, and eco-conscious civil engineering legacy.",
    keywords: "About MADECC Construction, Yaounde general contractor, Cameroon engineering legacy, building developers Central Africa, structural safety directors, construction company corporate profile, Brutalist designers"
  });

  const values = [
    {
      icon: <ShieldCheck size={28} className="text-brand-secondary" />,
      title: "Uncompromising Integrity",
      description: "Our word is as durable as our solid foundations. We conduct our business operations with complete transparency, maintaining high-integrity fiscal auditing, straightforward communication, and rigorous ethical compliance in every regional terminal."
    },
    {
      icon: <Cpu size={28} className="text-brand-secondary" />,
      title: "Precision Engineering",
      description: "We work to millimeter tolerances. From the initial soil and geological surveys to custom structural calculations, our engineers combine classical physics with cutting-edge telemetry software to guarantee optimal structural safety."
    },
    {
      icon: <Leaf size={28} className="text-brand-secondary" />,
      title: "Eco-Conscious Sustainability",
      description: "We build for tomorrow. By incorporating green building materials, optimizing thermal efficiency, and implementing smart recycling workflows, we ensure that our large-scale infrastructure projects respect and protect regional ecosystems."
    },
    {
      icon: <Users size={28} className="text-brand-secondary" />,
      title: "Collaborative Synergy",
      description: "Outstanding infrastructure projects require exceptional coordination. We unite award-winning architects, master engineers, local craftsmen, and visionary project managers into a unified project lifecycle delivery machine."
    }
  ];

  const milestones = [
    {
      year: "1998",
      title: "The Blueprint Epoch",
      location: "Yaoundé, Cameroon",
      description: "Founded as a specialized structural design consultancy. Our early projects focused on high-precision soil analysis, complex foundation physics, and architectural consulting for public facilities."
    },
    {
      year: "2007",
      title: "Horizontal & Vertical Expansion",
      location: "Cameroon & Central Africa",
      description: "Expanded our structural horizons into direct construction. MADECC successfully completed its first multi-story corporate headquarters and public-sector civic installations, validating our engineering limits."
    },
    {
      year: "2016",
      title: "Strategic Infrastructure Era",
      location: "Central African Subregion",
      description: "Launched major civil engineering divisions, tackling high-use vehicular highways, critical suspension bridges, and innovative industrial concrete hubs designed to empower regional logistics chains."
    },
    {
      year: "2023",
      title: "Digital Integration & Governance",
      location: "Headquarters",
      description: "Pioneered the integration of smart building automation and live site telemetry monitoring. Established our modern secure online administrative portal to track material workflows, payroll, and asset custody."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-brand-secondary selection:text-white">
      <Navbar />
      
      {/* Hero Header */}
      <main className="pt-40">
        <header className="max-w-7xl mx-auto px-6 mb-24 relative">
          <div className="absolute -top-10 left-0 w-24 h-[1px] bg-brand-secondary" />
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-brand-secondary font-black uppercase tracking-[0.4em] text-[10px] block mb-4">
              MADECC Profile
            </span>
            <h1 className="text-6xl md:text-[110px] font-black tracking-tighter uppercase leading-[0.85] mb-8">
              CRAFTING THE <br /> 
              <span className="text-brand-secondary italic lowercase font-normal">extraordinary</span>.
            </h1>
            <div className="h-[2px] w-48 bg-brand-secondary" />
          </motion.div>
        </header>

        {/* Brand Narrative Section */}
        <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-start mb-40">
          <div className="space-y-8">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-tight italic text-brand-secondary">
              A Legacy Built on <br /> Trust, Precision, and Concrete.
            </h2>
            <div className="space-y-6 text-slate-300 text-lg md:text-xl font-light leading-relaxed">
              <p>
                {pageOverrides.homeProfileSummary}
              </p>
              <p>
                Our structural framework consists of expert planners, precision geologists, and experienced field staff working in harmony. We manage every phase of the project lifecycle from pre-design modeling to the final delivery to ensure timeline discipline and budget integrity.
              </p>
            </div>
            
            {/* Stats Bar */}
            <div className="pt-12 border-t border-white/5 grid grid-cols-3 gap-8">
              <div>
                <p className="text-4xl md:text-5xl font-black font-mono text-brand-secondary">25+</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-2">Years of Excellence</p>
              </div>
              <div>
                <p className="text-4xl md:text-5xl font-black font-mono text-brand-secondary">150+</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-2">Completed Hubs</p>
              </div>
              <div>
                <p className="text-4xl md:text-5xl font-black font-mono text-brand-secondary">100%</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-2">Safety Rating</p>
              </div>
            </div>
          </div>
          
          {/* Aesthetic Images */}
          <div className="grid grid-cols-1 gap-8 relative">
            <div className="absolute inset-0 grid-pattern opacity-10 -z-0" />
            <div className="relative z-10 space-y-8">
              <div className="border border-white/5 p-2 bg-slate-900/40 backdrop-blur-sm">
                <img 
                  src="https://images.unsplash.com/photo-1541976590-713941fbc1c6?auto=format&fit=crop&q=80&w=2070" 
                  alt="Precision Civil Works"
                  className="w-full h-[320px] object-cover grayscale brightness-75 hover:grayscale-0 transition-all duration-700" 
                />
              </div>
              <div className="border border-white/5 p-2 bg-slate-900/40 backdrop-blur-sm lg:translate-x-12">
                <img 
                  src="/src/assets/images/skyline_towers_construction_1778998242725.png" 
                  alt="Architectural Columns Layout"
                  className="w-full h-[320px] object-cover grayscale brightness-90 hover:grayscale-0 transition-all duration-700" 
                />
              </div>
            </div>
          </div>
        </section>

        {/* Mission and Vision Grid */}
        <section className="py-24 bg-slate-900/40 border-y border-white/5 relative mb-40">
          <div className="absolute inset-0 grid-pattern opacity-5 pointer-events-none" />
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
              
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <div className="inline-flex p-3 bg-brand-secondary/10 border border-brand-secondary/20 rounded-lg">
                  <Target size={28} className="text-brand-secondary" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-white">
                  Our Clear Mission
                </h3>
                <p className="text-lg text-slate-300 font-light leading-relaxed">
                  {pageOverrides.missionStatement}
                </p>
                <ul className="space-y-3 pt-4 text-sm text-slate-400">
                  <li className="flex items-center gap-3">
                    <CheckCircle size={16} className="text-brand-secondary" aria-hidden="true" />
                    <span>Deliver project scopes on active zero-error milestones</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle size={16} className="text-brand-secondary" aria-hidden="true" />
                    <span>Minimize footprint impacts via sustainable engineering solutions</span>
                  </li>
                </ul>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <div className="inline-flex p-3 bg-brand-secondary/10 border border-brand-secondary/20 rounded-lg">
                  <Compass size={28} className="text-brand-secondary" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-white">
                  Our Vision Parameters
                </h3>
                <p className="text-lg text-slate-300 font-light leading-relaxed">
                  {pageOverrides.visionStatement}
                </p>
                <ul className="space-y-3 pt-4 text-sm text-slate-400">
                  <li className="flex items-center gap-3">
                    <CheckCircle size={16} className="text-brand-secondary" aria-hidden="true" />
                    <span>Establish carbon-neutral infrastructure networks by 2030</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle size={16} className="text-brand-secondary" aria-hidden="true" />
                    <span>Deploy state-of-the-art predictive remote failure-prevention sensor arrays</span>
                  </li>
                </ul>
              </motion.div>

            </div>
          </div>
        </section>

        {/* Company History / Timeline */}
        <section className="max-w-7xl mx-auto px-6 mb-40">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-6 h-[1px] bg-brand-secondary" />
              <span className="text-brand-secondary text-[10px] font-black uppercase tracking-[0.4em]">Chronological Record</span>
              <div className="w-6 h-[1px] bg-brand-secondary" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight">Our Rich History</h2>
            <p className="text-slate-400 mt-4 text-sm md:text-base leading-relaxed">{pageOverrides.corporateHistorySummary}</p>
          </div>

          <div className="relative border-l border-white/10 md:border-l-0 md:grid md:grid-cols-4 md:gap-8 gap-12 flex flex-col pl-6 md:pl-0">
            {milestones.map((m, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="relative bg-slate-900 border border-white/5 p-8 hover:border-brand-secondary/30 transition-all duration-300 group"
              >
                {/* Year Marker */}
                <div className="absolute -left-[33px] md:left-8 top-8 w-4 h-4 bg-slate-950 border-2 border-brand-secondary rounded-full group-hover:scale-125 transition-transform" />
                
                <span className="text-3xl font-black font-mono text-brand-secondary block mb-2">{m.year}</span>
                <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider block mb-4">{m.location}</span>
                <h4 className="text-lg font-bold text-white uppercase mb-4 tracking-tight group-hover:text-brand-secondary transition-colors">{m.title}</h4>
                <p className="text-slate-400 text-sm leading-relaxed font-light">{m.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Company Core Values */}
        <section className="max-w-7xl mx-auto px-6 mb-40">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-start">
            <div>
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="w-8 h-[2px] bg-brand-secondary" />
                <span className="text-brand-secondary font-black uppercase tracking-[0.3em] text-[10px]">Strategic Alignment</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight leading-none mb-6">
                Our Core <br />
                <span className="text-brand-secondary italic lowercase font-normal font-sans">pillars</span>.
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed font-light">
                These core parameters guide every contract sign, every concrete mix, and every engineering deployment across the continent.
              </p>
              
              <div className="mt-10 p-6 border border-white/5 bg-slate-900/50 rounded-lg flex items-start gap-4">
                <Award className="text-brand-secondary shrink-0" size={32} />
                <div>
                  <p className="text-xs uppercase font-black tracking-widest text-white mb-1">Quality Certified</p>
                  <p className="text-xs text-slate-500 leading-normal">Committed to strictly compliant international building standards and materials auditing.</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
              {values.map((v, idx) => (
                <div 
                  key={idx}
                  className="bg-slate-900 p-8 border border-white/5 hover:border-brand-secondary/20 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="bg-slate-950 p-3 inline-block border border-white/5 rounded-lg group-hover:border-brand-secondary/40 transition-colors">
                      {v.icon}
                    </div>
                    <h3 className="text-xl font-bold uppercase tracking-tight">{v.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed font-light">{v.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Corporate Governance Callout */}
        <section className="max-w-7xl mx-auto px-6 mb-32">
          <div className="bg-slate-900 border border-white/5 p-8 md:p-16 relative overflow-hidden">
            <div className="absolute inset-0 grid-pattern opacity-5 pointer-events-none" />
            <div className="relative z-10 max-w-3xl">
              <span className="text-xs font-black uppercase tracking-[0.3em] text-brand-secondary mb-4 block">Centralized Commands</span>
              <h3 className="text-3xl md:text-4xl font-bold uppercase tracking-tight text-white mb-6">
                Administrative Discipline & Trust
              </h3>
              <p className="text-slate-400 text-base md:text-lg leading-relaxed mb-6 font-light">
                Under the direct structural leadership of our Chief Executive Officer and active project managers, MADECC maintains complete governance protocols. No transaction occurs isolated; all secure contract sign structures, real-time employee ledgers, and financial releases verify within high-security protocols.
              </p>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-mono">
                SECURE ACCESS TERMINAL COMPLIANCE APPLIED - MADECC 1998-2026
              </p>
            </div>
          </div>
        </section>

      </main>

      <Footer />
      <ChatWidget />
    </div>
  );
}
