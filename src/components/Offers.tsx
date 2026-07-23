import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ViewState } from '../types';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { offersApi } from '../lib/api';
import { getSocket } from '../lib/socket';

interface OffersProps {
  onNavigate: (view: ViewState) => void;
  onOpenNewBid: () => void;
}

interface OfferRecord {
  id: string;
  sharkName: string;
  amount: string;
  equity: string;
  valuation?: string | null;
  terms: string;
  status: string;
  startup?: { name: string };
}

export function Offers({ onNavigate, onOpenNewBid }: OffersProps) {
  const [offers, setOffers] = useState<OfferRecord[]>([]);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadOffers = () => {
    offersApi.getAll()
      .then((data) => setOffers(Array.isArray(data) ? data : []))
      .catch(() => {});
  };

  useEffect(() => {
    loadOffers();

    const socket = getSocket();
    const refresh = () => loadOffers();
    socket.on('offer_created', refresh);
    socket.on('offer_updated', refresh);
    socket.on('offer_withdrawn', refresh);

    return () => {
      socket.off('offer_created', refresh);
      socket.off('offer_updated', refresh);
      socket.off('offer_withdrawn', refresh);
    };
  }, []);

  const handleAccept = async (offer: OfferRecord) => {
    setAcceptingId(offer.id);
    try {
      await offersApi.accept(offer.id);
      setToastMessage(`Term Sheet Accepted with ${offer.sharkName}! Escrow sequence initiated.`);
      setTimeout(() => setToastMessage(null), 4000);
      loadOffers();
    } catch {
      setAcceptingId(null);
    }
  };

  const targetCompany = offers[0]?.startup?.name || 'Live Pitch Stage';

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
                Target Company: <span className="text-primary font-bold">{targetCompany}</span>
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
            {offers.map((offer, index) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                highlight={index === 0}
                isAccepting={acceptingId === offer.id}
                delay={index * 0.1}
                onAccept={() => handleAccept(offer)}
                onEnterRoom={() => onNavigate('negotiation')}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function OfferCard({
  offer,
  highlight,
  isAccepting,
  delay,
  onAccept,
  onEnterRoom,
}: {
  offer: OfferRecord;
  highlight: boolean;
  isAccepting: boolean;
  delay: number;
  onAccept: () => void;
  onEnterRoom: () => void;
}) {
  const isAccepted = offer.status === 'ACCEPTED';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`bg-surface-container rounded-2xl border p-6 relative overflow-hidden transition-all ${
        isAccepted
          ? 'border-secondary shadow-[0_0_40px_rgba(16,185,129,0.2)] bg-secondary/5'
          : highlight
            ? 'border-secondary/60 shadow-[0_0_30px_rgba(16,185,129,0.08)]'
            : 'border-outline-variant'
      }`}
    >
      {highlight && <div className="absolute top-0 left-0 w-full h-1.5 bg-secondary" />}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="font-headline-md text-lg text-on-surface font-bold">{offer.sharkName}</h3>
          <span className="text-xs text-on-surface-variant">Investor</span>
        </div>
        {(isAccepted || highlight) && (
          <span className="bg-secondary/20 text-secondary text-[10px] font-label-mono uppercase tracking-wider px-2.5 py-1 rounded-full border border-secondary/30 font-bold">
            {isAccepted ? 'Accepted' : 'Best Valuation'}
          </span>
        )}
      </div>

      <div className="space-y-4 mb-8 font-label-mono">
        <div className="flex flex-col">
          <span className="text-on-surface-variant text-xs uppercase">Investment Capital:</span>
          <span className={`text-2xl font-bold ${highlight ? 'text-secondary' : 'text-on-surface'}`}>{offer.amount}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-on-surface-variant text-xs uppercase">Post-Money Valuation:</span>
          <span className="text-on-surface text-base">{offer.valuation || 'Undisclosed'}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-on-surface-variant text-xs uppercase">Equity Percentage:</span>
          <span className="text-on-surface text-base">{offer.equity}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-on-surface-variant text-xs uppercase">Terms & Governance:</span>
          <span className="text-on-surface text-xs font-body-md mt-0.5">{offer.terms}</span>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={onAccept}
          disabled={isAccepted || isAccepting}
          className={`w-full py-3.5 rounded-xl font-label-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-60 ${
            highlight
              ? 'bg-secondary hover:bg-secondary/90 text-on-secondary shadow-lg shadow-secondary/20'
              : 'bg-surface-bright hover:bg-surface-variant text-on-surface border border-outline-variant'
          }`}
        >
          {isAccepted ? '✓ Term Sheet Accepted' : isAccepting ? 'Accepting…' : 'Accept Term Sheet'}
        </button>

        <button
          onClick={onEnterRoom}
          className="w-full py-3 rounded-xl bg-surface-variant hover:bg-surface-bright border border-outline-variant text-on-surface font-label-mono text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          Enter Room <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
