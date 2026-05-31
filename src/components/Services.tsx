import { motion } from "motion/react";
import { HardHat, Ruler, Building, Truck, ShieldCheck, Drill } from "lucide-react";

const SERVICES = [
  {
    title: "Civil Engineering",
    description: "Complex structural solutions for sustainable urban environments and massive infrastructure projects.",
    icon: Ruler,
  },
  {
    title: "General Construction",
    description: "High-precision building services for commercial, industrial, and high-end residential sectors.",
    icon: Building,
  },
  {
    title: "Industrial Design",
    description: "Designing efficient, scalable industrial facilities that optimize workflow and energy consumption.",
    icon: HardHat,
  },
  {
    title: "Project Management",
    description: "End-to-end oversight ensuring projects are delivered on time, within budget, and above standard.",
    icon: ShieldCheck,
  },
  {
    title: "Logistics & Supply",
    description: "Strategic material sourcing and heavy equipment deployment across the Central African region.",
    icon: Truck,
  },
  {
    title: "Renovation & Retrofit",
    description: "Transforming aging structures into modern, energy-efficient landmarks with heritage preservation.",
    icon: Drill,
  },
];

export default function Services() {
  return (
    <section id="services" className="py-32 bg-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-5" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-12">
          <div>
            <div className="flex items-center gap-4 mb-4">
               <div className="w-12 h-[2px] bg-brand-secondary" />
               <span className="text-brand-secondary font-black uppercase tracking-[0.4em] text-[10px]">Specialized Solutions</span>
            </div>
            <h2 className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-none">Our Expertise</h2>
          </div>
          <p className="max-w-sm text-slate-500 font-medium text-sm leading-relaxed border-r border-brand-secondary/30 pr-8 text-right">
             Mastering technical complexity across multi-scale infrastructure and industrial engineering projects since 1998.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 border border-white/5">
          {SERVICES.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-900 p-16 group hover:bg-slate-800 transition-all duration-500 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                 <service.icon size={120} />
              </div>
              
              <div className="relative z-10">
                <div className="w-16 h-16 bg-slate-950 flex items-center justify-center mb-10 border border-white/5 group-hover:border-brand-secondary/50 transition-colors">
                   <service.icon size={32} className="text-brand-secondary" />
                </div>
                <h3 className="text-2xl font-black tracking-tight mb-6 uppercase group-hover:text-brand-secondary transition-colors">
                  {service.title}
                </h3>
                <p className="text-slate-500 group-hover:text-slate-300 transition-colors leading-relaxed font-medium">
                  {service.description}
                </p>
              </div>
              
              <div className="absolute bottom-0 left-0 w-0 h-1 bg-brand-secondary group-hover:w-full transition-all duration-700" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
