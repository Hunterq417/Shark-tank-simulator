import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ViewState } from '../types';
import { Play, Pause, Mic, MicOff, MoreHorizontal, FileText, CheckCircle2 } from 'lucide-react';
import { eventsApi, pitchApi, sharksApi } from '../lib/api';
import { getSocket } from '../lib/socket';

interface LivePitchProps {
  onNavigate: (view: ViewState) => void;
  onOpenNewBid: () => void;
  onOpenViewDeck: (company: string) => void;
}

interface LiveOffer {
  id: string;
  sharkName: string;
  amount: string;
  equity: string;
  createdAt: string;
}

function timeAgo(isoDate: string): string {
  const seconds = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);
  if (seconds < 60) return seconds <= 5 ? 'Just now' : `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export function LivePitch({ onNavigate, onOpenNewBid, onOpenViewDeck }: LivePitchProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [startup, setStartup] = useState<{
    name: string; fundingAsk: string; equityOffered: string; valuation: string; stage: string; description: string;
  } | null>(null);
  const [pitchStats, setPitchStats] = useState<{ totalCommitted: string; percentageCommitted: number } | null>(null);
  const [offers, setOffers] = useState<LiveOffer[]>([]);
  const [investors, setInvestors] = useState<{ id: string; name: string; hasOffered: boolean }[]>([]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadLiveEvent = () => {
    eventsApi.getLiveEvent()
      .then((event) => {
        if (event?.startup) {
          setStartup({
            name: event.startup.name,
            fundingAsk: event.startup.fundingAsk,
            equityOffered: event.startup.equityOffered,
            valuation: event.startup.valuation,
            stage: event.startup.stage,
            description: event.startup.description,
          });
          const sortedOffers = [...(event.startup.offers || [])]
            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 3);
          setOffers(sortedOffers);
        }
        if (event?.id) {
          pitchApi.getForEvent(event.id)
            .then((pitch) => setPitchStats({ totalCommitted: pitch.totalCommitted, percentageCommitted: pitch.percentageCommitted }))
            .catch(() => {});
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadLiveEvent();

    sharksApi.getAll()
      .then((sharks) => {
        if (Array.isArray(sharks)) {
          setInvestors(sharks.slice(0, 4).map((s: any) => ({ id: s.id, name: s.fundName, hasOffered: false })));
        }
      })
      .catch(() => {});

    const socket = getSocket();
    const refresh = () => loadLiveEvent();
    socket.on('offer_created', refresh);
    socket.on('offer_updated', refresh);
    return () => {
      socket.off('offer_created', refresh);
      socket.off('offer_updated', refresh);
    };
  }, []);

  const displayName = startup?.name || 'Nexus AI';

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
      <div className="flex-1 flex overflow-hidden relative z-10 p-6 gap-6">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />
        
        {/* Left Side: Video & Board */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          
          {/* Main Pitch Card (Video) */}
          <div className="glass-panel rounded-2xl p-6 flex-1 flex flex-col relative overflow-hidden border-primary/20">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
            <div className="flex justify-between items-center mb-6 relative z-10">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                    N
                  </div>
                  <h1 className="font-headline-lg text-3xl text-on-surface font-bold">{displayName}</h1>
               </div>
               <div className="flex items-center gap-2 bg-secondary/10 text-secondary px-3 py-1 rounded-full border border-secondary/20">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                  <span className="font-label-mono text-xs font-bold uppercase tracking-widest">Live</span>
               </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row gap-6 relative z-10 min-h-0">
               {/* Video Player Area */}
               <div className="flex-1 bg-black rounded-xl overflow-hidden relative border border-outline-variant flex flex-col min-h-[260px]">
                  <img 
                    src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop" 
                    className={`w-full h-full object-cover transition-opacity duration-300 ${isPlaying ? 'opacity-90' : 'opacity-40'}`} 
                    alt="Pitcher" 
                  />
                  
                  {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-surface/80 backdrop-blur-md p-4 rounded-full border border-outline-variant">
                        <Play className="w-8 h-8 text-white fill-current ml-1" />
                      </div>
                    </div>
                  )}

                  {/* Controls Overlay */}
                  <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent">
                     <div className="w-full h-1 bg-surface-variant rounded-full mb-4 overflow-hidden">
                        <div className="h-full bg-secondary w-1/3" />
                     </div>
                     <div className="flex items-center justify-between text-white">
                        <div className="flex items-center gap-3">
                           <button 
                            onClick={() => {
                              setIsPlaying(!isPlaying);
                              triggerToast(isPlaying ? 'Stream paused' : 'Stream resumed');
                            }}
                            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                           >
                            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                           </button>
                           
                           <button 
                            onClick={() => {
                              setIsMicMuted(!isMicMuted);
                              triggerToast(isMicMuted ? 'Microphone unmuted' : 'Microphone muted');
                            }}
                            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                           >
                            {isMicMuted ? <MicOff className="w-5 h-5 text-error" /> : <Mic className="w-5 h-5" />}
                           </button>
                        </div>

                        <button
                          onClick={() => onOpenViewDeck(displayName)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-md text-xs font-label-mono uppercase transition-colors cursor-pointer"
                        >
                          <FileText className="w-4 h-4 text-secondary" />
                          View Pitch Deck
                        </button>
                     </div>
                  </div>
               </div>

               {/* Stats & Actions Area */}
               <div className="w-full lg:w-80 flex flex-col gap-4">
                  <div className="bg-surface-container/50 rounded-xl p-5 border border-outline-variant">
                    <div className="space-y-4 font-label-mono text-sm">
                      <div className="flex justify-between">
                         <span className="text-on-surface-variant">Funding Request:</span>
                         <span className="text-on-surface font-bold">{startup?.fundingAsk || '$1.5M'}</span>
                      </div>
                      <div className="flex justify-between">
                         <span className="text-on-surface-variant">Equity Offered:</span>
                         <span className="text-on-surface font-bold">{startup?.equityOffered || '10%'}</span>
                      </div>
                      <div className="flex justify-between">
                         <span className="text-on-surface-variant">Valuation:</span>
                         <span className="text-on-surface font-bold">{startup?.valuation || '$15M'}</span>
                      </div>
                      <div className="flex justify-between">
                         <span className="text-on-surface-variant">Stage:</span>
                         <span className="text-on-surface">{startup?.stage || 'Seed'}</span>
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="flex justify-between text-sm mb-2">
                         <span className="font-bold text-on-surface">{pitchStats?.totalCommitted || '$850K'} <span className="font-normal text-on-surface-variant">Committed</span></span>
                         <span className="text-on-surface-variant font-label-mono">{pitchStats?.percentageCommitted ?? 57}%</span>
                      </div>
                      <div className="h-2 w-full bg-surface-variant rounded-full overflow-hidden">
                         <div className="h-full bg-secondary rounded-full" style={{ width: `${pitchStats?.percentageCommitted ?? 57}%` }} />
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-on-surface-variant px-2 leading-relaxed">
                    {startup?.description || 'Nexus AI is pioneering autonomous systems for enterprise machine learning solutions, bridging the gap between data and actionable intelligence.'}
                  </p>

                  <div className="mt-auto space-y-2">
                    <button 
                      onClick={onOpenNewBid}
                      className="w-full py-4 rounded-xl bg-secondary hover:bg-secondary/90 text-on-secondary font-label-mono font-bold text-sm uppercase tracking-wider transition-all shadow-lg shadow-secondary/20 cursor-pointer"
                    >
                      Submit Offer / Bid
                    </button>
                    <button 
                      onClick={() => onNavigate('negotiation')}
                      className="w-full py-2.5 rounded-xl bg-surface-variant hover:bg-surface-bright text-on-surface font-label-mono text-xs uppercase tracking-wider transition-colors border border-outline-variant cursor-pointer"
                    >
                      Enter Negotiation Room
                    </button>
                  </div>
               </div>
            </div>
          </div>

          {/* Live Offer Board */}
          <div className="h-24 glass-panel rounded-xl flex items-center px-6 relative overflow-hidden">
             <div className="absolute left-0 top-0 w-2 h-full bg-secondary" />
             <div className="flex flex-col mr-8 shrink-0">
                <span className="font-headline-md text-sm text-on-surface font-bold">Live Offer Ticker</span>
                <span className="text-xs text-on-surface-variant">Real-time room activity</span>
             </div>
             
             {/* Scrolling ticker */}
             <div className="flex-1 overflow-x-auto relative no-scrollbar">
                <div className="flex gap-4 items-center">
                   {offers.length > 0 ? offers.map((offer, i) => (
                     <OfferChip
                       key={offer.id}
                       name={offer.sharkName}
                       amount={offer.amount}
                       equity={offer.equity}
                       time={timeAgo(offer.createdAt)}
                       highlight={i === 0}
                       onClick={() => onNavigate('offers')}
                     />
                   )) : (
                     <span className="text-xs text-on-surface-variant font-label-mono">No offers yet — be the first to bid.</span>
                   )}
                </div>
             </div>
          </div>
        </div>

        {/* Right Sidebar: Investor Cards */}
        <div className="hidden lg:flex w-80 glass-panel rounded-2xl flex-col overflow-hidden relative border-primary/10">
           <div className="p-5 border-b border-outline-variant/50 bg-surface-container-low/50 flex justify-between items-center">
              <h3 className="font-headline-md text-base text-on-surface font-bold">Participating Investors</h3>
              <button onClick={() => triggerToast('Investor pool refreshed')} className="text-on-surface-variant hover:text-on-surface cursor-pointer">
                <MoreHorizontal className="w-5 h-5" />
              </button>
           </div>
           <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {investors.map((investor) => {
                const offer = offers.find((o) => o.sharkName === investor.name);
                return (
                  <InvestorCard
                    key={investor.id}
                    name={investor.name}
                    status={offer ? 'Offer Submitted' : 'Considering'}
                    statusColor={offer ? 'text-secondary' : undefined}
                    value={offer ? `${offer.amount} Offer` : undefined}
                    highlight={Boolean(offer)}
                    avatar={investor.name.charAt(0)}
                    onClick={() => triggerToast(`Selected ${investor.name}`)}
                  />
                );
              })}
           </div>
        </div>
      </div>
    </div>
  );
}

function OfferChip({ name, amount, equity, time, highlight, onClick }: { name: string, amount: string, equity?: string, time: string, highlight?: boolean, onClick?: () => void }) {
  return (
    <div onClick={onClick} className={`flex flex-col rounded-lg border ${highlight ? 'bg-secondary/10 border-secondary/30' : 'bg-surface-container border-outline-variant'} px-4 py-2 min-w-[200px] shrink-0 cursor-pointer hover:border-secondary transition-colors`}>
       <div className="flex justify-between text-[10px] mb-1 font-label-mono">
         <span className={highlight ? 'text-secondary font-bold' : 'text-on-surface-variant'}>{highlight ? 'New Offer:' : 'Offer'}</span>
         <span className="text-on-surface-variant">{time}</span>
       </div>
       <div className="flex items-center gap-2">
         <div className="w-5 h-5 rounded bg-surface-variant flex items-center justify-center text-xs font-bold font-display">{name.charAt(0)}</div>
         <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold text-on-surface">{name}</span>
            <span className="text-xs text-on-surface-variant">
              offers <span className="text-on-surface font-bold">{amount}</span> {equity && `for ${equity}`}
            </span>
         </div>
       </div>
    </div>
  );
}

function InvestorCard({ name, status, value, highlight, statusColor = "text-on-surface-variant", avatar, avatarImg, onClick }: { name: string, status: string, value?: string, highlight?: boolean, statusColor?: string, avatar?: string, avatarImg?: string, onClick?: () => void }) {
  return (
    <div onClick={onClick} className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${highlight ? 'bg-secondary/10 border-secondary/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'bg-surface-container/50 border-outline-variant hover:bg-surface-container'}`}>
       <div className="flex items-center gap-3">
         <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center overflow-hidden border border-outline-variant shrink-0">
           {avatarImg ? <img src={avatarImg} alt={name} className="w-full h-full object-cover" /> : <span className="font-display font-bold text-on-surface">{avatar}</span>}
         </div>
         <div className="flex flex-col">
            <span className="text-sm font-bold text-on-surface">{name}</span>
            <span className={`text-[10px] uppercase font-label-mono ${statusColor}`}>{status}</span>
         </div>
       </div>
       {value && (
         <span className={`text-sm font-label-mono ${highlight ? 'text-secondary font-bold' : 'text-on-surface'}`}>{value}</span>
       )}
    </div>
  );
}
