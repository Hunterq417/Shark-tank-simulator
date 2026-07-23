import { useState } from 'react';
import { motion } from 'motion/react';
import { ViewState } from '../types';
import { CheckCircle2, ArrowRight } from 'lucide-react';

interface OffersProps {
  onNavigate: (view: ViewState) => void;
  onOpenNewBid: () => void;
}

export function Offers({ onNavigate, onOpenNewBid }: OffersProps) {
  const [acceptedOffer, setAcceptedOffer] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleAccept = (offerName: string) => {
    setAcceptedOffer(offerName);
    setToastMessage(`Term Sheet Accepted with ${offerName}! Escrow sequence initiated.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background relative overflow-hidden">
      {/* Toast */}
      {toastMessage && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed top-20 right-8 z-50 bg-secondary-container text-on-secondary-container px-4 py-3 rounded-xl border border-secondary/30 shadow-2xl flex items-center gap-2 font-label-mono text-sm"
        >
          <CheckCircle2 className="w-5 h-5 text-secondary" />
          {toastMessage}
        </motion.div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant pb-6">
            <div>
              <h1 className="font-headline-lg text-3xl font-bold text-on-surface mb-2">Active Term Sheet Offers</h1>
              <p className="text-on-surface-variant text-sm font-label-mono uppercase tracking-wider">
                Target Company: <span className="text-primary font-bold">Quantum Dynamics AI</span>
              </p>
            </div>

            <button 
              onClick={onOpenNewBid}
              className="px-5 py-2.5 rounded-xl bg-secondary text-on-secondary font-label-mono font-bold text-xs uppercase tracking-wider hover:bg-secondary/90 transition-all shadow-lg shadow-secondary/20 cursor-pointer"
            >
              + Solicit Custom Bid
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Offer 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-surface-container rounded-2xl border p-6 relative overflow-hidden transition-all ${
                acceptedOffer === 'Apex Ventures' 
                  ? 'border-secondary shadow-[0_0_40px_rgba(16,185,129,0.2)] bg-secondary/5' 
                  : 'border-secondary/60 shadow-[0_0_30px_rgba(16,185,129,0.08)]'
              }`}
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-secondary" />
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-headline-md text-lg text-on-surface font-bold">Apex Ventures</h3>
                  <span className="text-xs text-on-surface-variant">Lead Syndicate</span>
                </div>
                <span className="bg-secondary/20 text-secondary text-[10px] font-label-mono uppercase tracking-wider px-2.5 py-1 rounded-full border border-secondary/30 font-bold">
                  {acceptedOffer === 'Apex Ventures' ? 'Accepted' : 'Best Valuation'}
                </span>
              </div>
              
              <div className="space-y-4 mb-8 font-label-mono">
                <div className="flex flex-col">
                  <span className="text-on-surface-variant text-xs uppercase">Investment Capital:</span>
                  <span className="text-2xl text-secondary font-bold">$2.5M</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-on-surface-variant text-xs uppercase">Post-Money Valuation:</span>
                  <span className="text-on-surface text-base">$25.0M</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-on-surface-variant text-xs uppercase">Equity Percentage:</span>
                  <span className="text-on-surface text-base">10.0%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-on-surface-variant text-xs uppercase">Terms & Governance:</span>
                  <span className="text-on-surface text-xs font-body-md mt-0.5">1 Board Seat, Major Investor Pro-rata Rights</span>
                </div>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => handleAccept('Apex Ventures')}
                  disabled={acceptedOffer === 'Apex Ventures'}
                  className="w-full py-3.5 rounded-xl bg-secondary hover:bg-secondary/90 text-on-secondary font-label-mono text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-secondary/20 cursor-pointer disabled:opacity-60"
                >
                  {acceptedOffer === 'Apex Ventures' ? '✓ Term Sheet Accepted' : 'Accept Term Sheet'}
                </button>
                
                <button 
                  onClick={() => onNavigate('negotiation')}
                  className="w-full py-3 rounded-xl bg-surface-variant hover:bg-surface-bright border border-outline-variant text-on-surface font-label-mono text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  Enter Room <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>

            {/* Offer 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`bg-surface-container rounded-2xl border p-6 relative overflow-hidden transition-all ${
                acceptedOffer === 'Silver Lake' 
                  ? 'border-secondary shadow-[0_0_40px_rgba(16,185,129,0.2)] bg-secondary/5' 
                  : 'border-outline-variant'
              }`}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-headline-md text-lg text-on-surface font-bold">Silver Lake</h3>
                  <span className="text-xs text-on-surface-variant">Growth Fund</span>
                </div>
                {acceptedOffer === 'Silver Lake' && (
                  <span className="bg-secondary/20 text-secondary text-[10px] font-label-mono uppercase tracking-wider px-2 py-1 rounded border border-secondary/30 font-bold">Accepted</span>
                )}
              </div>
              
              <div className="space-y-4 mb-8 font-label-mono">
                <div className="flex flex-col">
                  <span className="text-on-surface-variant text-xs uppercase">Investment Capital:</span>
                  <span className="text-2xl text-on-surface font-bold">$2.0M</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-on-surface-variant text-xs uppercase">Post-Money Valuation:</span>
                  <span className="text-on-surface text-base">$22.0M</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-on-surface-variant text-xs uppercase">Equity Percentage:</span>
                  <span className="text-on-surface text-base">9.0%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-on-surface-variant text-xs uppercase">Terms & Governance:</span>
                  <span className="text-on-surface text-xs font-body-md mt-0.5">Board Observer Rights</span>
                </div>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => handleAccept('Silver Lake')}
                  disabled={acceptedOffer === 'Silver Lake'}
                  className="w-full py-3.5 rounded-xl bg-surface-bright hover:bg-surface-variant text-on-surface border border-outline-variant font-label-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                >
                  {acceptedOffer === 'Silver Lake' ? '✓ Term Sheet Accepted' : 'Accept Term Sheet'}
                </button>
                <button 
                  onClick={() => onNavigate('negotiation')}
                  className="w-full py-3 rounded-xl bg-surface-variant hover:bg-surface-bright border border-outline-variant text-on-surface font-label-mono text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  Enter Room <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>

            {/* Offer 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`bg-surface-container rounded-2xl border p-6 relative overflow-hidden transition-all ${
                acceptedOffer === 'Sarah Jenkins (Angel)' 
                  ? 'border-secondary shadow-[0_0_40px_rgba(16,185,129,0.2)] bg-secondary/5' 
                  : 'border-outline-variant'
              }`}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-headline-md text-lg text-on-surface font-bold">Sarah Jenkins</h3>
                  <span className="text-xs text-on-surface-variant">Angel Investor</span>
                </div>
                {acceptedOffer === 'Sarah Jenkins (Angel)' && (
                  <span className="bg-secondary/20 text-secondary text-[10px] font-label-mono uppercase tracking-wider px-2 py-1 rounded border border-secondary/30 font-bold">Accepted</span>
                )}
              </div>
              
              <div className="space-y-4 mb-8 font-label-mono">
                <div className="flex flex-col">
                  <span className="text-on-surface-variant text-xs uppercase">Investment Capital:</span>
                  <span className="text-2xl text-on-surface font-bold">$500K</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-on-surface-variant text-xs uppercase">Post-Money Valuation:</span>
                  <span className="text-on-surface text-base">$20.0M</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-on-surface-variant text-xs uppercase">Equity Percentage:</span>
                  <span className="text-on-surface text-base">2.5%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-on-surface-variant text-xs uppercase">Terms & Governance:</span>
                  <span className="text-on-surface text-xs font-body-md mt-0.5">Advisory Board Member</span>
                </div>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => handleAccept('Sarah Jenkins (Angel)')}
                  disabled={acceptedOffer === 'Sarah Jenkins (Angel)'}
                  className="w-full py-3.5 rounded-xl bg-surface-bright hover:bg-surface-variant text-on-surface border border-outline-variant font-label-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                >
                  {acceptedOffer === 'Sarah Jenkins (Angel)' ? '✓ Term Sheet Accepted' : 'Accept Term Sheet'}
                </button>
                <button 
                  onClick={() => onNavigate('negotiation')}
                  className="w-full py-3 rounded-xl bg-surface-variant hover:bg-surface-bright border border-outline-variant text-on-surface font-label-mono text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  Enter Room <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
}
