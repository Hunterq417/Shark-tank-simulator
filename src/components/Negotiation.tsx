import { useState, KeyboardEvent } from 'react';
import { motion } from 'motion/react';
import { ViewState } from '../types';
import { ArrowLeft, MessageSquare, Send, Paperclip, Smile, CheckCircle2 } from 'lucide-react';

interface NegotiationProps {
  onNavigate: (view: ViewState) => void;
  onOpenCounterOffer: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'Investor' | 'Founder' | 'System';
  name: string;
  text: string;
  time: string;
}

export function Negotiation({ onNavigate, onOpenCounterOffer }: NegotiationProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'Investor', name: 'Apex Ventures', text: "We're interested, but the valuation is a bit high. Can you do $4.5M for 12%?", time: '10:42 AM' },
    { id: '2', sender: 'Founder', name: 'You', text: "We're confident in our projections. How about $4.8M for 11%?", time: '10:44 AM' },
    { id: '3', sender: 'Investor', name: 'Apex Ventures', text: "Let me discuss with my partners.", time: '10:45 AM' },
    { id: '4', sender: 'System', name: 'System', text: "New Offer Received from Apex Ventures: $4.5M for 12% Equity", time: '10:46 AM' },
  ]);

  const [inputMsg, setInputMsg] = useState('');
  const [activeOfferStatus, setActiveOfferStatus] = useState<'Active' | 'Accepted' | 'Rejected'>('Active');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSendMessage = () => {
    if (!inputMsg.trim()) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'Founder',
      name: 'You',
      text: inputMsg.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    setInputMsg('');

    // Simulated reply after 1.5 seconds
    setTimeout(() => {
      const replies = [
        "Sounds good! We can proceed with drafting the definitive agreements.",
        "Understood. Let us review that clause with our legal counsel.",
        "That works for us. Sending the revised term sheet over now!"
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'Investor',
          name: 'Apex Ventures',
          text: randomReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1500);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleAccept = () => {
    setActiveOfferStatus('Accepted');
    triggerToast('Offer Accepted! Generated binding Term Sheet document.');
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'System',
        name: 'System',
        text: 'Offer of $4.5M for 12% Equity ACCEPTED by Founder. Deal Room locked.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleReject = () => {
    setActiveOfferStatus('Rejected');
    triggerToast('Offer Rejected.');
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'System',
        name: 'System',
        text: 'Offer of $4.5M for 12% Equity REJECTED by Founder.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
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

      {/* Top Bar Header */}
      <header className="flex justify-between items-center px-8 h-20 border-b border-outline-variant bg-surface-container-lowest shrink-0 z-20 shadow-sm relative">
         <div className="flex flex-col z-10">
            <div className="flex items-center gap-3">
               <h1 className="font-headline-lg text-2xl font-bold text-on-surface">Live Negotiation Room</h1>
               <div className="flex items-center gap-1.5 bg-secondary/10 text-secondary px-2.5 py-0.5 rounded-full border border-secondary/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                  <span className="font-label-mono text-[10px] font-bold uppercase tracking-widest">Live Room</span>
               </div>
            </div>
            <button 
               onClick={() => onNavigate('offers')}
               className="text-on-surface-variant hover:text-on-surface text-xs flex items-center gap-1 mt-1 transition-colors w-fit cursor-pointer"
            >
               <ArrowLeft className="w-3.5 h-3.5" /> Back to Offer Comparison
            </button>
         </div>

         <div className="flex items-center gap-4 z-10">
           <button 
              onClick={() => onNavigate('offers')}
              className="text-on-surface-variant hover:text-error text-xs font-label-mono uppercase px-4 py-2 border border-outline-variant rounded-lg hover:border-error/40 transition-colors cursor-pointer"
           >
              Exit Room
           </button>
         </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
           
           {/* Left: Your Ask */}
           <div className="w-full lg:w-80 flex flex-col shrink-0">
             <h2 className="font-headline-md text-lg text-on-surface font-bold mb-4">Original Pitch Ask</h2>
             <div className="bg-surface-container/40 border border-primary/20 rounded-xl overflow-hidden glass-panel relative">
               <div className="h-2 w-full bg-gradient-to-r from-primary to-blue-500" />
               <div className="p-6">
                  <div className="flex items-center gap-4 mb-6 pb-6 border-b border-outline-variant">
                     <div className="w-12 h-12 rounded-lg bg-surface-variant border border-outline-variant flex items-center justify-center p-2 font-display font-bold text-primary text-2xl">
                        Q
                     </div>
                     <h3 className="font-headline-md text-xl text-on-surface font-bold">Quantum Dynamics AI</h3>
                  </div>

                  <div className="space-y-4 font-label-mono text-sm mb-6 pb-6 border-b border-outline-variant">
                     <div className="flex justify-between">
                        <span className="text-on-surface-variant">Target Capital:</span>
                        <span className="text-on-surface font-bold">$5.0M</span>
                     </div>
                     <div className="flex justify-between">
                        <span className="text-on-surface-variant">Equity Offered:</span>
                        <span className="text-on-surface font-bold">10.0%</span>
                     </div>
                     <div className="flex justify-between">
                        <span className="text-on-surface-variant">Pre-Money Valuation:</span>
                        <span className="text-on-surface font-bold">$45.0M</span>
                     </div>
                  </div>

                  <div>
                     <h4 className="text-on-surface-variant text-xs font-label-mono uppercase mb-3">Pitch Summary</h4>
                     <ul className="text-on-surface text-xs space-y-2 pl-4 list-disc list-outside marker:text-primary">
                        <li>Enterprise Machine Learning Solutions</li>
                        <li>Looking to scale sales & marketing</li>
                        <li>B2B SaaS model, $2M ARR</li>
                     </ul>
                  </div>
               </div>
             </div>
           </div>

           {/* Right: Deal Chat & Management */}
           <div className="flex-1 flex flex-col min-w-0 space-y-6">
             <h2 className="font-headline-md text-lg text-on-surface font-bold">Real-time Deal Chat & Offer Management</h2>
             
             {/* Active Offer Card */}
             <div className="glass-panel border-secondary/30 rounded-2xl p-6 shadow-[0_0_40px_rgba(16,185,129,0.08)] relative overflow-hidden">
                <div className="flex justify-between items-start relative z-10 mb-6">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-surface-variant flex items-center justify-center font-display font-bold text-xl text-secondary border border-outline-variant">A</div>
                      <div>
                         <h3 className="text-on-surface-variant text-xs font-label-mono uppercase">Lead Investor: Apex Ventures</h3>
                         <div className="font-display text-3xl font-bold text-on-surface my-1">$4.5M <span className="text-2xl font-normal text-on-surface-variant">for</span> 12.0% Equity</div>
                         <p className="font-label-mono text-xs text-secondary font-bold">Implied Valuation: $37.5M</p>
                      </div>
                   </div>
                   <span className={`font-label-mono text-xs uppercase tracking-wider border px-3 py-1 rounded-full font-bold ${
                     activeOfferStatus === 'Accepted' ? 'bg-secondary/20 text-secondary border-secondary' :
                     activeOfferStatus === 'Rejected' ? 'bg-error/20 text-error border-error' :
                     'bg-secondary/10 text-secondary border-secondary/30'
                   }`}>
                     {activeOfferStatus === 'Active' ? 'Active Term Sheet' : activeOfferStatus}
                   </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 relative z-10">
                   <button 
                    onClick={handleAccept}
                    disabled={activeOfferStatus !== 'Active'}
                    className="py-3 rounded-xl bg-secondary hover:bg-secondary/90 text-on-secondary font-label-mono font-bold uppercase tracking-wider text-xs transition-colors shadow-lg shadow-secondary/20 cursor-pointer disabled:opacity-50"
                   >
                    {activeOfferStatus === 'Accepted' ? '✓ Accepted' : 'Accept Term Sheet'}
                   </button>
                   
                   <button 
                    onClick={handleReject}
                    disabled={activeOfferStatus !== 'Active'}
                    className="py-3 rounded-xl bg-error/10 hover:bg-error/20 text-error border border-error/30 font-label-mono font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer disabled:opacity-50"
                   >
                    Reject
                   </button>
                   
                   <button 
                    onClick={onOpenCounterOffer}
                    className="py-3 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-label-mono font-bold uppercase tracking-wider text-xs transition-colors shadow-lg shadow-primary/20 cursor-pointer"
                   >
                    Submit Counter-Offer
                   </button>
                </div>
             </div>

             {/* Chat Interface */}
             <div className="flex-1 glass-panel rounded-2xl border border-outline-variant flex flex-col overflow-hidden min-h-[380px]">
                <div className="p-4 border-b border-outline-variant bg-surface-container/50 flex justify-between items-center">
                   <h3 className="font-headline-md text-sm text-on-surface font-bold flex items-center gap-2">
                     <MessageSquare className="w-4 h-4 text-primary" /> Live Deal Room Chat
                   </h3>
                   <span className="text-[10px] font-label-mono text-secondary">Encrypted Institutional Stream</span>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-4 font-label-mono text-xs">
                   {messages.map((m) => {
                     if (m.sender === 'System') {
                       return (
                        <div key={m.id} className="bg-surface-container rounded-xl p-4 border border-outline-variant text-on-surface flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-secondary shrink-0" />
                            <span className="text-secondary font-bold">{m.text}</span>
                          </div>
                          <span className="text-[10px] text-on-surface-variant shrink-0">{m.time}</span>
                        </div>
                       );
                     }

                     const isMe = m.sender === 'Founder';
                     return (
                       <div key={m.id} className={`flex justify-between items-start gap-4 p-3 rounded-xl ${isMe ? 'bg-primary/10 border border-primary/20 ml-8' : 'bg-surface-container/80 border border-outline-variant mr-8'}`}>
                         <div>
                           <span className={`font-bold ${isMe ? 'text-primary' : 'text-secondary'}`}>[{m.sender}] {m.name}:</span>
                           <p className="text-on-surface mt-1 font-body-md text-sm leading-relaxed">{m.text}</p>
                         </div>
                         <span className="text-[10px] text-on-surface-variant shrink-0">{m.time}</span>
                       </div>
                     );
                   })}
                </div>

                {/* Input area */}
                <div className="p-4 border-t border-outline-variant bg-surface-container/50 flex gap-2">
                   <div className="flex-1 bg-surface rounded-xl border border-outline-variant flex items-center px-4 focus-within:border-primary transition-colors">
                      <input 
                        type="text" 
                        placeholder="Type counter offer or question..." 
                        value={inputMsg}
                        onChange={(e) => setInputMsg(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 bg-transparent border-none outline-none text-xs text-on-surface py-3 font-body-md" 
                      />
                   </div>
                   <button 
                    onClick={handleSendMessage}
                    className="bg-primary hover:bg-primary/90 text-on-primary rounded-xl px-6 flex items-center gap-2 font-label-mono text-xs uppercase font-bold transition-all shadow-md cursor-pointer"
                   >
                     Send <Send className="w-3.5 h-3.5" />
                   </button>
                </div>
             </div>
           </div>

        </div>
      </div>
    </div>
  );
}
