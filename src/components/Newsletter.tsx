import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Check, AlertCircle, Loader2 } from 'lucide-react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message);
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to establish transmission.');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Network error. Structural integrity of transmission compromised.');
    }
  };

  return (
    <section id="newsletter" className="py-24 bg-slate-950 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter leading-none">
              Synchronize with <br />
              <span className="text-brand-secondary">The Journal</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-md italic font-medium">
              Join 5,000+ structural engineers and architects receiving weekly dispatches on technical excellence and tropical climate engineering.
            </p>
            <div className="flex items-center gap-4 text-slate-500">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px] font-bold">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">+ 4.8k Active Nodes</span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-brand-secondary/10 blur-3xl rounded-full" />
            <form 
              onSubmit={handleSubmit}
              className="relative bg-slate-900/50 border border-white/5 p-8 md:p-12 backdrop-blur-xl"
            >
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 block">
                  Cpt. Initialization Sequence
                </label>
                <div className="flex flex-col md:flex-row gap-4">
                  <input
                    type="email"
                    required
                    placeholder="ENTER_EMAIL_ADDRESS"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 px-6 py-4 text-sm font-mono text-white focus:outline-none focus:border-brand-secondary transition-all placeholder:text-slate-700"
                  />
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="bg-brand-secondary hover:bg-white text-white hover:text-brand-secondary px-8 py-4 font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    {status === 'loading' ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>
                        Subscribe
                        <Send size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {status === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-6 p-4 bg-green-500/10 border border-green-500/20 flex items-center gap-3"
                  >
                    <Check size={18} className="text-green-500 shrink-0" />
                    <p className="text-xs font-bold text-green-500 uppercase tracking-widest">{message}</p>
                  </motion.div>
                )}
                {status === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-6 p-4 bg-red-500/10 border border-red-500/20 flex items-center gap-3"
                  >
                    <AlertCircle size={18} className="text-red-500 shrink-0" />
                    <p className="text-xs font-bold text-red-500 uppercase tracking-widest">{message}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-8 pt-8 border-t border-white/5">
                <p className="text-[9px] text-slate-600 uppercase tracking-widest leading-loose">
                  By subscribing, you agree to our <span className="text-slate-400">Security Protocol 6-B</span>. Data is encrypted and dispatched via verified structural channels only. Unsubscribe with 1-click.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
