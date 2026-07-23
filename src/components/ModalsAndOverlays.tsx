import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  DollarSign, 
  Percent, 
  Send, 
  FileText, 
  HelpCircle, 
  LogOut, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  Sparkles,
  MessageSquare
} from 'lucide-react';

/* NEW BID MODAL */
export function NewBidModal({ 
  isOpen, 
  onClose, 
  onSubmitBid 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSubmitBid: (bid: { company: string; amount: string; equity: string; terms: string }) => void;
}) {
  const [company, setCompany] = useState('Nexus AI');
  const [amount, setAmount] = useState('$1,500,000');
  const [equity, setEquity] = useState('10%');
  const [terms, setTerms] = useState('Pro-rata rights, 1 Board Seat');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-surface-container border border-outline-variant rounded-2xl w-full max-w-lg p-6 shadow-2xl glass-panel space-y-6"
        >
          <div className="flex justify-between items-center border-b border-outline-variant pb-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-secondary" />
              <h3 className="font-headline-md text-lg text-on-surface font-bold">Submit New Institutional Bid</h3>
            </div>
            <button onClick={onClose} className="p-1 text-on-surface-variant hover:text-on-surface"><X className="w-5 h-5" /></button>
          </div>

          <div className="space-y-4 font-label-mono text-xs">
            <div>
              <label className="block text-on-surface-variant uppercase mb-1">Target Startup</label>
              <select 
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full bg-surface border border-outline-variant rounded-lg p-3 text-on-surface text-sm focus:outline-none focus:border-primary"
              >
                <option value="Nexus AI">Nexus AI (Ask: $2.5M for 15%)</option>
                <option value="Quantum Dynamics AI">Quantum Dynamics AI (Ask: $5.0M for 10%)</option>
                <option value="EcoTech Solutions">EcoTech Solutions (Ask: $1.8M for 10%)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-on-surface-variant uppercase mb-1">Capital Investment ($)</label>
                <input 
                  type="text" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-surface border border-outline-variant rounded-lg p-3 text-on-surface text-sm focus:outline-none focus:border-primary font-bold"
                />
              </div>

              <div>
                <label className="block text-on-surface-variant uppercase mb-1">Requested Equity (%)</label>
                <input 
                  type="text" 
                  value={equity}
                  onChange={(e) => setEquity(e.target.value)}
                  className="w-full bg-surface border border-outline-variant rounded-lg p-3 text-on-surface text-sm focus:outline-none focus:border-primary font-bold text-secondary"
                />
              </div>
            </div>

            <div>
              <label className="block text-on-surface-variant uppercase mb-1">Key Conditions & Terms</label>
              <textarea 
                rows={3}
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                className="w-full bg-surface border border-outline-variant rounded-lg p-3 text-on-surface text-sm focus:outline-none focus:border-primary font-body-md"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={onClose} className="px-5 py-2.5 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-variant font-label-mono text-xs uppercase">Cancel</button>
            <button 
              onClick={() => {
                onSubmitBid({ company, amount, equity, terms });
                onClose();
              }} 
              className="px-6 py-2.5 rounded-lg bg-secondary text-on-secondary font-label-mono font-bold text-xs uppercase tracking-wider hover:bg-secondary/90 shadow-lg shadow-secondary/20"
            >
              Submit Bid
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

/* VIEW DECK MODAL */
export function ViewDeckModal({ isOpen, onClose, companyName = 'Nexus AI' }: { isOpen: boolean; onClose: () => void; companyName?: string }) {
  const [slide, setSlide] = useState(1);
  const totalSlides = 5;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-surface-container border border-outline-variant rounded-2xl w-full max-w-4xl p-6 shadow-2xl glass-panel space-y-4 flex flex-col h-[600px]"
      >
        <div className="flex justify-between items-center border-b border-outline-variant pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <h3 className="font-headline-md text-lg text-on-surface font-bold">{companyName} - Pitch Deck (Confidential)</h3>
          </div>
          <button onClick={onClose} className="p-1 text-on-surface-variant hover:text-on-surface"><X className="w-5 h-5" /></button>
        </div>

        {/* Slide Viewer */}
        <div className="flex-1 bg-surface-container-lowest rounded-xl border border-outline-variant p-8 flex flex-col justify-between items-center text-center relative overflow-hidden">
          <div className="absolute top-4 left-4 font-label-mono text-xs text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
            Slide {slide} of {totalSlides}
          </div>

          <div className="my-auto space-y-4 max-w-xl">
            {slide === 1 && (
              <>
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-400 to-blue-600 flex items-center justify-center text-white text-3xl font-bold">N</div>
                <h2 className="font-display text-4xl font-bold text-on-surface">{companyName}</h2>
                <p className="text-on-surface-variant text-lg">Autonomous ML Infrastructure for Enterprise Workflow Intelligence</p>
              </>
            )}
            {slide === 2 && (
              <>
                <h3 className="font-headline-lg text-2xl text-secondary font-bold">The Problem & Market Opportunity</h3>
                <p className="text-on-surface-variant leading-relaxed text-sm">Enterprise ML deployments suffer from a 78% failure rate due to manual data pipeline friction, costing over $42B globally in engineering waste.</p>
              </>
            )}
            {slide === 3 && (
              <>
                <h3 className="font-headline-lg text-2xl text-primary font-bold">The Solution & Product</h3>
                <p className="text-on-surface-variant leading-relaxed text-sm">Self-healing autonomous ML pipelines with sub-millisecond execution and real-time model retraining.</p>
              </>
            )}
            {slide === 4 && (
              <>
                <h3 className="font-headline-lg text-2xl text-tertiary font-bold">Traction & Financial Metrics</h3>
                <div className="grid grid-cols-2 gap-4 text-left font-label-mono text-sm pt-4">
                  <div className="bg-surface-container p-4 rounded-xl border border-outline-variant">
                    <div className="text-on-surface-variant text-xs">ARR</div>
                    <div className="text-xl text-secondary font-bold">$2.2M (+140% YoY)</div>
                  </div>
                  <div className="bg-surface-container p-4 rounded-xl border border-outline-variant">
                    <div className="text-on-surface-variant text-xs">Enterprise Clients</div>
                    <div className="text-xl text-primary font-bold">28 Fortune 500</div>
                  </div>
                </div>
              </>
            )}
            {slide === 5 && (
              <>
                <h3 className="font-headline-lg text-2xl text-on-surface font-bold">The Ask</h3>
                <div className="p-6 bg-surface-container rounded-2xl border border-secondary/30 space-y-2 font-label-mono">
                  <div className="text-3xl font-bold text-secondary">$2.5M Seed Round</div>
                  <div className="text-sm text-on-surface-variant">Allocated to R&D scaling and US Enterprise sales expansion</div>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button 
              disabled={slide === 1}
              onClick={() => setSlide(slide - 1)} 
              className="p-2 rounded-lg bg-surface-variant text-on-surface disabled:opacity-30"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-label-mono text-xs text-on-surface-variant">{slide} / {totalSlides}</span>
            <button 
              disabled={slide === totalSlides}
              onClick={() => setSlide(slide + 1)} 
              className="p-2 rounded-lg bg-surface-variant text-on-surface disabled:opacity-30"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* SUPPORT & FAQ MODAL */
export function SupportModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [subject, setSubject] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-surface-container border border-outline-variant rounded-2xl w-full max-w-lg p-6 shadow-2xl glass-panel space-y-6"
      >
        <div className="flex justify-between items-center border-b border-outline-variant pb-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            <h3 className="font-headline-md text-lg text-on-surface font-bold">Institutional Support Desk</h3>
          </div>
          <button onClick={onClose} className="p-1 text-on-surface-variant hover:text-on-surface"><X className="w-5 h-5" /></button>
        </div>

        {submitted ? (
          <div className="text-center py-8 space-y-4">
            <CheckCircle2 className="w-12 h-12 text-secondary mx-auto" />
            <h4 className="font-bold text-on-surface text-lg">Ticket Submitted</h4>
            <p className="text-xs text-on-surface-variant">Your priority institutional desk ticket has been assigned to a deal manager.</p>
            <button onClick={onClose} className="px-6 py-2 bg-surface-variant text-on-surface rounded-lg text-xs font-label-mono uppercase">Close</button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-label-mono text-on-surface-variant uppercase">Issue Subject</label>
              <input 
                type="text" 
                placeholder="e.g. Escrow transfer confirmation, Term sheet clause" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-surface border border-outline-variant rounded-lg p-3 text-sm text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-label-mono text-on-surface-variant uppercase">Details</label>
              <textarea 
                rows={4}
                placeholder="Describe your query or transaction reference..." 
                className="w-full bg-surface border border-outline-variant rounded-lg p-3 text-sm text-on-surface focus:outline-none focus:border-primary font-body-md"
              />
            </div>

            <button 
              onClick={() => setSubmitted(true)}
              className="w-full py-3 bg-primary text-on-primary font-label-mono font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/20"
            >
              Submit Support Ticket
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

/* SIGN OUT MODAL */
export function SignOutModal({ isOpen, onClose, onConfirm }: { isOpen: boolean; onClose: () => void; onConfirm: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-surface-container border border-outline-variant rounded-2xl w-full max-w-md p-6 shadow-2xl glass-panel space-y-6 text-center"
      >
        <LogOut className="w-12 h-12 text-error mx-auto" />
        <div>
          <h3 className="font-headline-md text-xl text-on-surface font-bold">Sign Out of Sharktank Simulator</h3>
          <p className="text-xs text-on-surface-variant mt-2">Are you sure you want to exit your active institutional session?</p>
        </div>

        <div className="flex gap-3 justify-center pt-2">
          <button onClick={onClose} className="px-5 py-2.5 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-variant font-label-mono text-xs uppercase">Cancel</button>
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }} 
            className="px-6 py-2.5 rounded-lg bg-error text-on-error font-label-mono font-bold text-xs uppercase tracking-wider hover:bg-error/90 shadow-lg shadow-error/20"
          >
            Confirm Sign Out
          </button>
        </div>
      </motion.div>
    </div>
  );
}
