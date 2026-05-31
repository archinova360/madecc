import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'invalid-email'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    service: 'Construction', 
    location: 'Yaounde',
    projectType: 'Residential',
    sqm: '150',
    message: '' 
  });

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const calculateEstimate = () => {
    const sqmNum = parseFloat(formData.sqm) || 0;
    if (sqmNum <= 0) return { min: 0, max: 0, minUsd: 0, maxUsd: 0 };

    let baseMin = 250000;
    let baseMax = 450000;

    switch (formData.projectType) {
      case 'Residential':
        baseMin = 250000;
        baseMax = 450000;
        break;
      case 'Commercial':
        baseMin = 400000;
        baseMax = 750000;
        break;
      case 'Industrial':
        baseMin = 300000;
        baseMax = 600000;
        break;
      case 'Infrastructure':
        baseMin = 600000;
        baseMax = 1200000;
        break;
    }

    let locationMultiplier = 1.0;
    switch (formData.location) {
      case 'Douala':
        locationMultiplier = 1.18;
        break;
      case 'Kribi':
        locationMultiplier = 1.25;
        break;
      case 'Garoua':
        locationMultiplier = 1.12;
        break;
      case 'Bamenda':
        locationMultiplier = 1.05;
        break;
      default:
        locationMultiplier = 1.0;
    }

    const min = Math.round(sqmNum * baseMin * locationMultiplier);
    const max = Math.round(sqmNum * baseMax * locationMultiplier);
    
    const minUsd = Math.round(min / 605);
    const maxUsd = Math.round(max / 605);

    return { min, max, minUsd, maxUsd };
  };

  const calculateDetailedBreakdown = () => {
    const sqmNum = parseFloat(formData.sqm) || 0;
    if (sqmNum <= 0) return null;

    const est = calculateEstimate();
    const totalMin = est.min;

    // Realistic Cameroon local material costs index 2026
    const cementCost = Math.round(totalMin * 0.35);
    const steelCost = Math.round(totalMin * 0.20);
    const masonryCost = Math.round(totalMin * 0.15);
    const materialsTotal = cementCost + steelCost + masonryCost;

    // Local labor / workforce indices
    const eliteLaborCost = Math.round(totalMin * 0.15); // Masons, Master builders, supervisors
    const engineeringCost = Math.round(totalMin * 0.10); // Structural analysis, safety cert, layout
    const squadLaborCost = Math.round(totalMin * 0.05); // General site helpers, excavation squads
    const laborTotal = eliteLaborCost + engineeringCost + squadLaborCost;

    // Physical metrics based on Cameroon building indexes
    const cementBags = Math.round(sqmNum * 4.2); // ~4.2 standard bags (CPJ-35/CPJ-45) per SQM
    const steelKg = Math.round(sqmNum * 14.5); // ~14.5kg rebar/steel grid per SQM
    const blockCount = Math.round(sqmNum * 26); // ~26 concrete hollow blocks per SQM
    const laborDays = Math.round(sqmNum * 0.85); // Estimated staff-days

    return {
      cementCost,
      steelCost,
      masonryCost,
      materialsTotal,
      eliteLaborCost,
      engineeringCost,
      squadLaborCost,
      laborTotal,
      cementBags,
      steelKg,
      blockCount,
      laborDays
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(formData.email)) {
      setStatus('invalid-email');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    const est = calculateEstimate();
    const formattedEstimates = `${est.min.toLocaleString()} XAF - ${est.max.toLocaleString()} XAF (~$${est.minUsd.toLocaleString()} - $${est.maxUsd.toLocaleString()} USD)`;

    // Embed diagnostic estimator parameters into the message payload beautifully
    const summaryMessage = `
[VIRTUAL COST ESTIMATE GENERATED]
- Structure Type: ${formData.projectType}
- Projected Geography: ${formData.location}
- Surface Area: ${formData.sqm} m²
- Dynamic Cost Valuation: ${formattedEstimates}
--------------------------------------
[Project Specifications From Client]
${formData.message}
`;

    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      service: formData.service,
      location: formData.location,
      projectType: formData.projectType,
      sqm: formData.sqm,
      budgetRange: formattedEstimates,
      message: summaryMessage
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const contentType = response.headers.get("content-type");
      let data;
      
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error("Non-JSON response received:", {
          status: response.status,
          statusText: response.statusText,
          contentType,
          bodySample: text.substring(0, 200)
        });
        throw new Error(`Server returned non-JSON response (${response.status}): ${text.substring(0, 100)}...`);
      }

      if (response.ok) {
        setStatus('success');
        setFormData({ 
          name: '', 
          email: '', 
          phone: '', 
          service: 'Construction', 
          location: 'Yaounde',
          projectType: 'Residential',
          sqm: '150',
          message: '' 
        });
      } else {
        setErrorMessage(data?.error || `Submission failed (Status ${response.status}). Please try again.`);
        setStatus('error');
      }
    } catch (error: any) {
      console.error("Submission error details:", error);
      if (error.message.includes("non-JSON")) {
        setErrorMessage("Deployment Link Broken: The contact API was not found. Please ensure server actions are running.");
      } else if (error.name === 'AbortError') {
        setErrorMessage("Request timed out. Please try again.");
      } else {
        setErrorMessage(`Error: ${error.message || 'Network error or server unavailable.'}`);
      }
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="py-32 bg-slate-950 text-white relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          
          <div className="flex flex-col">
            <span className="text-brand-secondary font-bold uppercase tracking-[0.3em] mb-4 text-xs">Contact Us</span>
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-none uppercase">LET'S BUILD <br /> SOMETHING GREAT.</h2>
            <p className="text-slate-400 text-lg mb-12 max-w-md font-medium leading-relaxed border-l-2 border-brand-secondary/30 pl-8">
              Whether you have a specific project in mind or just want to explore possibilities, our team is ready to assist.
            </p>
            
            <div className="space-y-6 mb-12">
               <div>
                  <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-1">Global HQ</p>
                  <a 
                    href="https://maps.app.goo.gl/wbHUNHdpcEagX8of9" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-xl font-black tracking-tight text-white hover:text-brand-secondary transition-colors"
                  >
                    Yaounde, Carrefour Mbankolo
                  </a>
               </div>
               <div>
                  <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-1">Inquiries</p>
                  <p className="text-xl font-black tracking-tight text-white">+237 683-316-486 / madeccco5@gmail.com</p>
               </div>
               <div className="pt-8 border-t border-white/5">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-brand-secondary font-black mb-2 px-1 border-l-2 border-brand-secondary">Staff & Administration</p>
                  <p className="text-sm text-slate-500 leading-relaxed italic font-medium">
                    Personnel requiring internal terminal access keys must contact the Chief Executive Officer directly for multi-factor verification and issuance.
                  </p>
               </div>
            </div>

            {/* Google Maps Embed */}
            <div className="h-64 md:h-80 w-full rounded-2xl overflow-hidden grayscale contrast-125 opacity-70 hover:opacity-100 hover:grayscale-0 transition-all duration-700 bg-zinc-900 border border-white/5">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15918.57795328!2d11.5!3d3.8667!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x108bcf7a309a7927%3A0x1234567890abcdef!2zM8KwNTInMDEuMiJOIDExwrAzMCcwMC4wIkU!5e0!3m2!1sen!2scm!4v1715344300000!5m2!1sen!2scm" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="filter invert hue-rotate-180"
              />
            </div>
          </div>

          <div className="bg-slate-900 p-8 md:p-12 relative overflow-hidden group border border-white/5">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-secondary/10 blur-3xl -mr-12 -mt-12 transition-all group-hover:bg-brand-secondary/20" />
            
            <AnimatePresence mode="wait">
              {status === 'success' ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12"
                >
                  <div className="w-24 h-24 bg-brand-secondary rounded-none flex items-center justify-center shadow-2xl shadow-brand-secondary/40">
                     <CheckCircle2 size={48} className="text-white" />
                  </div>
                  <h3 className="text-3xl font-black tracking-tighter uppercase italic">Transmission Received</h3>
                  <p className="text-slate-400 max-w-xs font-medium">Our team will review your proposal and initiate contact within 24 operational hours.</p>
                  <button 
                    onClick={() => setStatus('idle')}
                    className="mt-8 px-8 py-3 border border-brand-secondary text-xs font-black uppercase tracking-widest text-brand-secondary hover:bg-brand-secondary hover:text-white transition-all shadow-lg shadow-brand-secondary/10"
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (                <motion.form 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onSubmit={handleSubmit}
                  className="space-y-10"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-10">
                    {/* Item 1: Full Name */}
                    <div className="group relative">
                      <input
                        type="text"
                        required
                        placeholder=" "
                        className="w-full bg-transparent border-b border-white/10 py-4 outline-none focus:border-brand-secondary transition-colors peer font-mono text-sm uppercase font-bold text-white placeholder-transparent"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        id="form-client-name"
                      />
                      <label htmlFor="form-client-name" className="absolute left-0 top-4 text-slate-500 uppercase tracking-widest text-xs font-black transition-all pointer-events-none peer-focus:-top-2 peer-focus:text-brand-secondary peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-brand-secondary">
                        Full Name
                      </label>
                    </div>
 
                    {/* Item 2: Email Address */}
                    <div className="group relative">
                      <input
                        type="email"
                        required
                        placeholder=" "
                        className="w-full bg-transparent border-b border-white/10 py-4 outline-none focus:border-brand-secondary transition-colors peer font-mono text-sm text-white placeholder-transparent"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        id="form-client-email"
                      />
                      <label htmlFor="form-client-email" className="absolute left-0 top-4 text-slate-500 uppercase tracking-widest text-xs font-black transition-all pointer-events-none peer-focus:-top-2 peer-focus:text-brand-secondary peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-brand-secondary">
                        Email Address
                      </label>
                    </div>

                    {/* Item 3: Phone Number */}
                    <div className="group relative">
                      <input
                        type="tel"
                        placeholder=" "
                        className="w-full bg-transparent border-b border-white/10 py-4 outline-none focus:border-brand-secondary transition-colors peer font-mono text-sm text-white placeholder-transparent"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        id="form-client-phone"
                      />
                      <label htmlFor="form-client-phone" className="absolute left-0 top-4 text-slate-500 uppercase tracking-widest text-xs font-black transition-all pointer-events-none peer-focus:-top-2 peer-focus:text-brand-secondary peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-brand-secondary">
                        Phone Number
                      </label>
                    </div>
 
                    {/* Item 4: Service Category */}
                    <div className="group relative">
                      <select
                        className="w-full bg-transparent border-b border-white/10 py-4 outline-none focus:border-brand-secondary transition-colors text-white uppercase tracking-widest text-xs font-black cursor-pointer appearance-none"
                        value={formData.service}
                        onChange={e => setFormData({ ...formData, service: e.target.value })}
                        id="form-client-service"
                      >
                        <option value="Construction" className="bg-slate-900">General Construction</option>
                        <option value="Renovation" className="bg-slate-900">Renovation & Remodel</option>
                        <option value="Civil Engineering" className="bg-slate-900">Civil Engineering</option>
                        <option value="Consulting" className="bg-slate-900">Project Consulting</option>
                        <option value="Public Works" className="bg-slate-900">Public Works</option>
                      </select>
                      <label htmlFor="form-client-service" className="absolute left-0 -top-2 text-brand-secondary uppercase tracking-widest text-[10px] font-black">
                        Service Category
                      </label>
                    </div>

                    {/* Item 5: Structural Type */}
                    <div className="group relative">
                      <select
                        className="w-full bg-transparent border-b border-white/10 py-4 outline-none focus:border-brand-secondary transition-colors text-white uppercase tracking-widest text-xs font-black cursor-pointer appearance-none"
                        value={formData.projectType}
                        onChange={e => setFormData({ ...formData, projectType: e.target.value })}
                        id="estimator-type"
                      >
                        <option value="Residential" className="bg-slate-900">Residential Structure</option>
                        <option value="Commercial" className="bg-slate-900">Commercial Hub</option>
                        <option value="Industrial" className="bg-slate-900">Industrial & Warehouse</option>
                        <option value="Infrastructure" className="bg-slate-900">Civil & Infrastructure</option>
                      </select>
                      <label htmlFor="estimator-type" className="absolute left-0 -top-2 text-slate-500 uppercase tracking-widest text-[10px] font-black">
                        Structural Class / Type
                      </label>
                    </div>

                    {/* Item 6: Area Size (SQM) */}
                    <div className="group relative">
                      <input
                        type="number"
                        required
                        min="10"
                        max="100000"
                        className="w-full bg-transparent border-b border-white/10 py-4 pr-12 outline-none focus:border-brand-secondary transition-colors peer font-mono text-sm text-white placeholder-transparent"
                        value={formData.sqm}
                        onChange={e => setFormData({ ...formData, sqm: e.target.value })}
                        id="estimator-sqm"
                      />
                      <span className="absolute right-0 top-4 text-slate-500 font-mono text-xs font-bold pointer-events-none uppercase">
                        m²
                      </span>
                      <label htmlFor="estimator-sqm" className="absolute left-0 top-4 text-slate-500 uppercase tracking-widest text-xs font-black transition-all pointer-events-none peer-focus:-top-2 peer-focus:text-brand-secondary peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-brand-secondary">
                        Area Size (SQM)
                      </label>
                    </div>

                    {/* Item 7: Project Location */}
                    <div className="group relative">
                      <select
                        className="w-full bg-transparent border-b border-white/10 py-4 outline-none focus:border-brand-secondary transition-colors text-white uppercase tracking-widest text-xs font-black cursor-pointer appearance-none"
                        value={formData.location}
                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                        id="estimator-location"
                      >
                        <option value="Yaounde" className="bg-slate-900">Yaoundé (Centre)</option>
                        <option value="Douala" className="bg-slate-900">Douala (Littoral)</option>
                        <option value="Kribi" className="bg-slate-900">Kribi (Ocean Zone)</option>
                        <option value="Garoua" className="bg-slate-900">Garoua (Northern Logistics)</option>
                        <option value="Bamenda" className="bg-slate-900">Bamenda (Highlands)</option>
                      </select>
                      <label htmlFor="estimator-location" className="absolute left-0 -top-2 text-slate-500 uppercase tracking-widest text-[10px] font-black">
                        Project Location
                      </label>
                    </div>

                    {/* Item 8: Dynamic Cost Valuation Card! */}
                    <div className="bg-slate-950/90 border border-brand-secondary/30 p-4 relative overflow-hidden flex flex-col justify-between min-h-[72px] rounded-lg">
                      <div className="absolute top-0 right-0 w-2 h-full bg-brand-secondary/20" />
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          Budget Valuation
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                          </span>
                          <span className="text-[8px] font-mono text-emerald-400 uppercase tracking-widest font-black leading-none">
                            Active Compute
                          </span>
                        </div>
                      </div>
                      <div className="mt-2">
                        {parseFloat(formData.sqm) > 0 ? (
                          <>
                            <p className="text-sm md:text-base font-black text-brand-secondary italic font-mono tracking-tight leading-none">
                              {calculateEstimate().min.toLocaleString()} - {calculateEstimate().max.toLocaleString()} <span className="text-[9px] not-italic font-sans text-slate-400 font-bold ml-0.5">XAF</span>
                            </p>
                            <p className="text-[10px] font-bold text-zinc-300 font-mono tracking-tight mt-1 leading-none">
                              ~ ${calculateEstimate().minUsd.toLocaleString()} - ${calculateEstimate().maxUsd.toLocaleString()} <span className="text-[8px] font-sans text-slate-500 font-bold ml-0.5">USD</span>
                            </p>
                          </>
                        ) : (
                          <p className="text-[10px] font-mono font-bold text-slate-500 uppercase italic">
                            Enter size to compute estimate
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Real-life Labor & Materials Cost Calculator Expansion */}
                  <AnimatePresence>
                    {parseFloat(formData.sqm) > 0 && (() => {
                      const breakdown = calculateDetailedBreakdown();
                      if (!breakdown) return null;
                      return (
                        <motion.div
                          initial={{ opacity: 0, height: 0, y: 15 }}
                          animate={{ opacity: 1, height: 'auto', y: 0 }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                          className="overflow-hidden border border-brand-secondary/20 bg-slate-950/60 p-6 rounded-lg space-y-6"
                        >
                          <div className="flex items-center justify-between border-b border-white/5 pb-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-brand-secondary">
                              Real-Life Structural Cost Breakdown (Est. 2026 Index)
                            </span>
                            <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                              Surface Area: {formData.sqm} m²
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
                            {/* Materials Sub-Ledger */}
                            <div className="space-y-4">
                              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-secondary" />
                                1. Material Resources (70%)
                              </h4>
                              <div className="space-y-3 font-mono text-slate-400">
                                <div className="flex justify-between items-center bg-white/5 p-2 rounded">
                                  <span>CPJ-35/45 Cement ({breakdown.cementBags} bags)</span>
                                  <span className="text-white font-bold">{breakdown.cementCost.toLocaleString()} XAF</span>
                                </div>
                                <div className="flex justify-between items-center bg-white/5 p-2 rounded">
                                  <span>Reinforcements ({breakdown.steelKg} kg Steel)</span>
                                  <span className="text-white font-bold">{breakdown.steelCost.toLocaleString()} XAF</span>
                                </div>
                                <div className="flex justify-between items-center bg-white/5 p-2 rounded">
                                  <span>Structural Masonry ({breakdown.blockCount} concrete blocks)</span>
                                  <span className="text-white font-bold">{breakdown.masonryCost.toLocaleString()} XAF</span>
                                </div>
                                <div className="flex justify-between border-t border-white/10 pt-2 text-[10px] font-black text-white uppercase tracking-wider">
                                  <span>Total Materials Devolution:</span>
                                  <span className="text-brand-secondary">{breakdown.materialsTotal.toLocaleString()} XAF</span>
                                </div>
                              </div>
                            </div>

                            {/* Labor Sub-Ledger */}
                            <div className="space-y-4">
                              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-secondary" />
                                2. Engineering & Labor Squads (30%)
                              </h4>
                              <div className="space-y-3 font-mono text-slate-400">
                                <div className="flex justify-between items-center bg-white/5 p-2 rounded">
                                  <span>Architectural & Safety Engineering</span>
                                  <span className="text-white font-bold">{breakdown.engineeringCost.toLocaleString()} XAF</span>
                                </div>
                                <div className="flex justify-between items-center bg-white/5 p-2 rounded">
                                  <span>Master Craftsmen & Masons</span>
                                  <span className="text-white font-bold">{breakdown.eliteLaborCost.toLocaleString()} XAF</span>
                                </div>
                                <div className="flex justify-between items-center bg-white/5 p-2 rounded">
                                  <span>Excavation & Support Squads ({breakdown.laborDays} staff-days)</span>
                                  <span className="text-white font-bold">{breakdown.squadLaborCost.toLocaleString()} XAF</span>
                                </div>
                                <div className="flex justify-between border-t border-white/10 pt-2 text-[10px] font-black text-white uppercase tracking-wider">
                                  <span>Total Workforce Devolution:</span>
                                  <span className="text-brand-secondary">{breakdown.laborTotal.toLocaleString()} XAF</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-brand-secondary/5 border border-brand-secondary/10 p-3 rounded text-[9px] text-slate-500 uppercase tracking-wide leading-normal italic text-center">
                            * Material metrics are compiled using local Yaoundé/Douala yard rates, factoring in sand, gravel, structural timber, and transport complexities in Cameroon for 2026.
                          </div>
                        </motion.div>
                      );
                    })()}
                  </AnimatePresence>
 
                  <div className="group relative">
                    <textarea
                      required
                      placeholder=" "
                      rows={4}
                      className="w-full bg-transparent border-b border-white/10 py-4 outline-none focus:border-brand-secondary transition-colors peer resize-none font-mono text-sm text-white placeholder-transparent"
                      value={formData.message}
                      onChange={e => setFormData({ ...formData, message: e.target.value })}
                      id="form-client-specifications"
                    ></textarea>
                    <label htmlFor="form-client-specifications" className="absolute left-0 top-4 text-slate-500 uppercase tracking-widest text-xs font-black transition-all pointer-events-none peer-focus:-top-2 peer-focus:text-brand-secondary peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-brand-secondary">
                      Project Specifications
                    </label>
                  </div>
 
                  <button
                    disabled={status === 'loading'}
                    className="w-full bg-brand-secondary text-white font-black uppercase tracking-[0.4em] py-6 flex items-center justify-center gap-3 hover:translate-y-[-2px] active:translate-y-0 transition-all disabled:opacity-50 relative overflow-hidden group/btn shadow-xl shadow-brand-secondary/20"
                  >
                    <span className="relative z-10">{status === 'loading' ? 'Encrypting Data...' : 'Submit Request'}</span>
                    <Send size={18} className="relative z-10 group-hover/btn:translate-x-2 group-hover/btn:-translate-y-2 transition-transform" />
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
                  </button>
                  
                  {(status === 'error' || status === 'invalid-email') && (
                    <div className="flex items-start gap-2 text-red-500 text-[10px] font-bold uppercase leading-tight">
                      <AlertCircle size={14} className="shrink-0" />
                      <span>
                        {status === 'invalid-email' ? 'Please enter a valid email address.' : errorMessage}
                      </span>
                    </div>
                  )}
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
