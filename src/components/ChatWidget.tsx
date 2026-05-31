import { MessageCircle, X, Send, Phone, MessageSquare } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

interface Message {
  role: 'user' | 'model';
  parts: [{ text: string }];
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      parts: [{ text: "Welcome to the MADECC technical terminal. How can we assist with your structural engineering or construction inquiry today?" }]
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const whatsappNumber = "237683316486";
  const callNumber = "237671063511";

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      parts: [{ text: input }]
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          history: messages.slice(1)
        }),
      });

      const data = await response.json();
      
      if (data.text) {
        setMessages(prev => [...prev, {
          role: 'model',
          parts: [{ text: data.text }]
        }]);
      } else {
        throw new Error(data.error || "Failed to get response");
      }
    } catch (error) {
      console.warn("API chatbot endpoint offline or missing key, deploying local failover matrix standard:", error);
      const textLower = input.toLowerCase();
      let responseText = "";

      if (textLower.includes("cost") || textLower.includes("price") || textLower.includes("budget") || textLower.includes("estimate") || textLower.includes("rate") || textLower.includes("sqm") || textLower.includes("much")) {
        responseText = `Based on our 2026 Cameroon Construction Index, our structural cost guidelines are:
• Residential Structures: ~140,000 to 220,000 XAF ($230-$360) per m²
• Commercial Hubs: ~180,000 to 280,000 XAF ($300-$460) per m²
• Industrial Warehouses: ~120,000 to 180,000 XAF ($200-$300) per m²

To calculate a live budget estimate customized for your specific location in Cameroon, please scroll down to the Contact Form and use our built-in Virtual Cost Estimator!`;
      } else if (textLower.includes("human") || textLower.includes("person") || textLower.includes("physical") || textLower.includes("representative") || textLower.includes("assistant") || textLower.includes("agent") || textLower.includes("talk") || textLower.includes("call") || textLower.includes("phone") || textLower.includes("whatsapp")) {
        responseText = `Understood. Patching you through directly to a MADECC Physical Assistant for a personal structural consult:
• Direct Hotlines: +237 671063511 (Direct Call)
• WhatsApp Support: +237 683316486

You can click any of the live action chips right at the bottom of this terminal window to start the connection instantly.`;
      } else if (textLower.includes("service") || textLower.includes("civil") || textLower.includes("construction") || textLower.includes("structural") || textLower.includes("renovate") || textLower.includes("remodel") || textLower.includes("build") || textLower.includes("engineer")) {
        responseText = `MADECC Group is a premium engineering firm providing extensive build capabilities:
1. General Building Construction & Project Delivery
2. Civil Foundations, Highway and Bridge Structural Engineering
3. Safety Audit Inspections & Precision Calculations
4. Feasibility Studies & Modern Architectural Design

Feel free to connect with a builder via WhatsApp/Call at any stage.`;
      } else if (textLower.includes("about") || textLower.includes("firm") || textLower.includes("company") || textLower.includes("madecc") || textLower.includes("location") || textLower.includes("office") || textLower.includes("where") || textLower.includes("hq")) {
        responseText = `MADECC Construction Ltd is a premier precision engineering firm based in Cameroon.
• Global Headquarters: Yaoundé, Carrefour Mbankolo
• Coverage: Yaoundé, Douala, Kribi, Garoua, and Bamenda.
• Mission: To create zero-defect safety-certified infrastructures that withstand generational forces.`;
      } else {
        responseText = `Transmission acknowledged. I am the MADECC Technical Copilot, ready to assist you. 

For instant service, I suggest connecting directly with a MADECC build supervisor:
• WhatsApp: +237 683316486
• Phone: +237 671063511

How would you like to proceed with your civil or structural requirements today?`;
      }

      setMessages(prev => [...prev, {
        role: 'model',
        parts: [{ text: responseText }]
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-10 right-10 z-[100] flex flex-col items-end gap-4">
      {/* Floating Action Buttons */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex flex-col gap-3 mb-2"
          >
            {/* WhatsApp */}
            <motion.a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1, x: -5 }}
              className="w-12 h-12 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-[#25D366]/40 transition-all group relative"
              title="WhatsApp"
            >
              <MessageSquare size={20} />
              <span className="absolute right-full mr-4 bg-white text-black text-[8px] font-black uppercase tracking-widest px-3 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-gray-100">
                WhatsApp
              </span>
            </motion.a>

            {/* Call */}
            <motion.a
              href={`tel:${callNumber}`}
              whileHover={{ scale: 1.1, x: -5 }}
              className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-blue-600/40 transition-all group relative"
              title="Call Now"
            >
              <Phone size={20} />
              <span className="absolute right-full mr-4 bg-white text-black text-[8px] font-black uppercase tracking-widest px-3 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-gray-100">
                Direct Call
              </span>
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-20 right-0 w-[350px] bg-slate-900 border border-white/10 shadow-2xl flex flex-col max-h-[500px]"
          >
            <div className="bg-brand-secondary p-5 text-white flex justify-between items-center">
              <div>
                <h4 className="font-black uppercase tracking-widest text-xs">MADECC Assistant</h4>
                <p className="text-[9px] opacity-80 mt-0.5 uppercase font-bold tracking-widest italic">Structural integrity verified</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-transform">
                <X size={20} />
              </button>
            </div>
            
            <div 
              ref={scrollRef}
              className="p-6 flex-1 overflow-y-auto bg-slate-950/50 backdrop-blur-sm space-y-4 no-scrollbar min-h-[300px]"
            >
                {messages.map((msg, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] p-3 text-[11px] leading-relaxed font-medium ${
                      msg.role === 'user' 
                        ? 'bg-brand-secondary text-white rounded-l-xl rounded-tr-xl' 
                        : 'bg-slate-800 text-slate-200 border-l-2 border-brand-secondary rounded-r-xl rounded-tl-xl'
                    }`}>
                      {msg.parts[0].text}
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-800 p-3 rounded-r-xl rounded-tl-xl flex gap-1">
                      <div className="w-1 h-1 bg-brand-secondary animate-bounce" />
                      <div className="w-1 h-1 bg-brand-secondary animate-bounce delay-100" />
                      <div className="w-1 h-1 bg-brand-secondary animate-bounce delay-200" />
                    </div>
                  </div>
                )}
            </div>

            {/* Quick Actions Bar to Connect with Physical Assistant */}
            <div className="px-4 py-3 border-t border-white/5 bg-slate-900 flex flex-wrap gap-2 justify-center shrink-0">
              <a 
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] text-[9.5px] font-black uppercase tracking-widest flex items-center gap-1 transition-all rounded"
              >
                <MessageSquare size={11} /> WhatsApp Representative
              </a>
              <a 
                href={`tel:${callNumber}`}
                className="px-2.5 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-600/30 text-blue-400 text-[9.5px] font-black uppercase tracking-widest flex items-center gap-1 transition-all rounded"
              >
                <Phone size={11} /> Call Assistant
              </a>
              <button 
                onClick={() => {
                  const element = document.getElementById('contact');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                    setIsOpen(false);
                  }
                }}
                className="px-2.5 py-1.5 bg-brand-secondary/10 hover:bg-brand-secondary/20 border border-brand-secondary/30 text-brand-secondary text-[9.5px] font-black uppercase tracking-widest transition-all cursor-pointer rounded"
              >
                📝 Cost Estimator
              </button>
            </div>

            <div className="p-4 border-t border-white/5 bg-slate-950 flex items-center gap-3">
               <input 
                 type="text" 
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                 placeholder="Message transmission..."
                 className="flex-1 bg-transparent border-none outline-none text-[11px] font-medium placeholder:text-slate-700 text-white"
               />
               <button 
                 onClick={handleSendMessage}
                 disabled={isLoading}
                 className="text-brand-secondary p-2 hover:text-white transition-colors disabled:opacity-50"
               >
                  <Send size={18} />
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-brand-secondary text-white flex items-center justify-center shadow-2xl shadow-brand-secondary/40 hover:scale-110 active:scale-95 transition-all group relative rounded-none"
      >
        {isOpen ? <X size={24} /> : (
          <>
            <MessageCircle size={24} />
            <div className="absolute inset-0 bg-white/20 animate-ping rounded-none opacity-20" />
          </>
        )}
        {!isOpen && (
          <div className="absolute -top-12 right-0 bg-white text-black text-[8px] font-black uppercase tracking-widest px-3 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
             Technical Support
          </div>
        )}
      </button>
    </div>
  );
}
