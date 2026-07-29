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
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant pb-6">
            <div>
              <p className="text-on-surface-variant text-[10px] font-label-mono uppercase tracking-[0.3em] mb-2">Term Sheets on the Table</p>
              <h1 className="font-display text-4xl font-semibold text-on-surface tracking-tight">{targetCompany}</h1>
            </div>

            <button
              onClick={onOpenNewBid}
              className="px-5 py-2.5 border border-primary/40 text-primary font-label-mono text-[11px] uppercase tracking-[0.15em] hover:bg-primary hover:text-on-primary transition-colors cursor-pointer"
            >
              Solicit Custom Bid
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
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="paper brass-edge pl-7 pr-6 py-7 flex flex-col"
    >
      {/* Document header */}
      <div className="flex justify-between items-start pb-4 mb-5 border-b border-[#d8d0bf]">
        <div>
          <p className="text-[9px] font-label-mono uppercase tracking-[0.25em] text-[#a09883]">Lead Investor</p>
          <h3 className="font-display text-xl font-semibold text-[#1c1a15] mt-1">{offer.sharkName}</h3>
        </div>
        {isAccepted ? (
          <span className="text-[9px] font-label-mono uppercase tracking-[0.2em] px-2 py-1 text-[#dcebe2]" style={{ background: 'var(--baize)' }}>
            Executed
          </span>
        ) : highlight ? (
          <span className="text-[9px] font-label-mono uppercase tracking-[0.2em] px-2 py-1 border border-[#8a6d34] text-[#8a6d34]">
            Best Terms
          </span>
        ) : null}
      </div>

      {/* The figure — engraved, the hero of the document */}
      <div className="mb-1">
        <p className="text-[9px] font-label-mono uppercase tracking-[0.25em] text-[#a09883]">Investment Capital</p>
        <p className="fig text-4xl text-[#1c1a15] mt-1">{offer.amount}</p>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-5 mb-6">
        <div>
          <p className="text-[9px] font-label-mono uppercase tracking-[0.2em] text-[#a09883]">Equity</p>
          <p className="fig text-lg text-[#1c1a15] mt-0.5">{offer.equity}</p>
        </div>
        <div>
          <p className="text-[9px] font-label-mono uppercase tracking-[0.2em] text-[#a09883]">Post-Money</p>
          <p className="fig text-lg text-[#1c1a15] mt-0.5">{offer.valuation || '—'}</p>
        </div>
        <div className="col-span-2">
          <p className="text-[9px] font-label-mono uppercase tracking-[0.2em] text-[#a09883]">Terms &amp; Governance</p>
          <p className="text-xs text-[#4a463d] leading-relaxed mt-1">{offer.terms}</p>
        </div>
      </div>

      <div className="mt-auto space-y-2 pt-4 border-t border-[#d8d0bf]">
        <button
          onClick={onAccept}
          disabled={isAccepted || isAccepting}
          className="w-full py-3 font-label-mono text-[11px] uppercase tracking-[0.2em] transition-colors cursor-pointer disabled:opacity-70"
          style={
            isAccepted
              ? { background: 'var(--baize)', color: '#dcebe2' }
              : { background: '#1c1a15', color: 'var(--bone)' }
          }
        >
          {isAccepted ? 'Term Sheet Executed' : isAccepting ? 'Executing…' : 'Accept Term Sheet'}
        </button>

        <button
          onClick={onEnterRoom}
          className="w-full py-2.5 text-[#6b665b] hover:text-[#1c1a15] font-label-mono text-[10px] uppercase tracking-[0.2em] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
        >
          Enter Negotiation <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
}
