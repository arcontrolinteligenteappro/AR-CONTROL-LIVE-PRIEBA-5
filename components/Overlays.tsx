
import React from 'react';
import { OverlayLayer, ScoreState, SportProfile, ChatMessage, SocialProof, StreamAlert } from '../types';
import { SPORTS_PROFILES } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';
import { BaseballScorebug } from './BaseballScoreboard';
import { Trophy, Clock, ShoppingCart, MessageSquare, Youtube, Twitch, Facebook, QrCode, Tag, UserCheck, AlertCircle, Heart, Star, DollarSign, Flag } from 'lucide-react';

// --- TYPE A: SOCCER / HOCKEY (Goals + Time + Cards) ---
const TypeAScoreboard: React.FC<{ data: ScoreState; formattedTime: string; label: string }> = ({ data, formattedTime, label }) => (
  <motion.div 
    initial={{ y: -50, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    exit={{ y: -50, opacity: 0 }}
    className="absolute top-8 left-8 flex bg-gradient-to-r from-zinc-900 to-black rounded border border-zinc-700 shadow-[0_4px_20px_rgba(0,0,0,0.5)] overflow-hidden z-50 font-sans"
  >
    {/* HOME */}
    <div className="flex flex-col items-center justify-center px-4 py-2 bg-zinc-800 border-r border-zinc-700 min-w-[90px] relative">
       <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{data.homeName}</span>
       <span className="text-3xl font-bold text-white leading-none">{data.homeScore}</span>
       {/* Cards */}
       <div className="flex gap-1 absolute bottom-1 right-1">
           {(data.cards?.homeRed || 0) > 0 && <div className="w-2 h-3 bg-red-600 rounded-sm shadow-sm"></div>}
           {(data.cards?.homeYellow || 0) > 0 && <div className="w-2 h-3 bg-yellow-500 rounded-sm shadow-sm"></div>}
       </div>
    </div>
    
    {/* CENTER INFO */}
    <div className="flex flex-col items-center justify-center px-3 py-1 min-w-[90px] bg-black/50 backdrop-blur border-x border-zinc-800">
       <div className="text-lg font-mono text-green-500 font-bold tracking-wider flex items-center gap-1">
          {formattedTime}
          {data.clockSeconds > 2700 && <span className="text-[10px] text-green-700">+3</span>}
       </div>
       <div className="text-[9px] text-zinc-400 font-bold uppercase mt-1">
         {label} {data.period}
       </div>
    </div>

    {/* GUEST */}
    <div className="flex flex-col items-center justify-center px-4 py-2 bg-zinc-800 border-l border-zinc-700 min-w-[90px] relative">
       <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{data.guestName}</span>
       <span className="text-3xl font-bold text-white leading-none">{data.guestScore}</span>
       {/* Cards */}
       <div className="flex gap-1 absolute bottom-1 left-1">
           {(data.cards?.guestRed || 0) > 0 && <div className="w-2 h-3 bg-red-600 rounded-sm shadow-sm"></div>}
           {(data.cards?.guestYellow || 0) > 0 && <div className="w-2 h-3 bg-yellow-500 rounded-sm shadow-sm"></div>}
       </div>
    </div>
  </motion.div>
);

// --- TYPE B: BASKETBALL / NFL (Points + Period + Possession + Stats) ---
const TypeBScoreboard: React.FC<{ data: ScoreState; formattedTime: string; label: string; sportId: string }> = ({ data, formattedTime, label, sportId }) => {
  const isNFL = sportId === 'nfl';
  
  return (
    <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-stretch bg-black border-t-4 border-red-600 shadow-2xl z-50 overflow-hidden rounded-t-lg font-sans"
    >
        {/* HOME */}
        <div className={`px-6 py-2 bg-zinc-900 flex gap-4 items-center relative ${data.possession === 'home' ? 'bg-zinc-800' : ''}`}>
        {data.possession === 'home' && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-yellow-500 animate-pulse"></div>}
        <div className="flex flex-col items-start">
            <span className="font-black text-white uppercase text-xl tracking-tight">{data.homeName}</span>
            <div className="flex gap-2 text-[9px] font-bold text-zinc-500 mt-1">
                {isNFL ? (
                    <><span>T.O: {data.timeouts?.home}</span></>
                ) : (
                    <><span>FOULS: {data.fouls?.home}</span></>
                )}
            </div>
        </div>
        <span className="text-4xl font-black text-yellow-500 font-mono">{data.homeScore}</span>
        </div>
        
        {/* CLOCK & STATUS */}
        <div className="px-4 py-2 bg-red-800 text-white font-mono font-bold flex flex-col items-center leading-none justify-center min-w-[100px] relative">
            <div className="text-2xl">{formattedTime}</div>
            <div className="text-[10px] uppercase opacity-80 mt-1">{label} {data.period}</div>
            
            {/* NFL Down & Distance */}
            {isNFL && data.down && (
                <div className="absolute -top-6 bg-yellow-500 text-black px-2 py-0.5 rounded-t font-bold text-xs shadow-md">
                    {data.down === 1 ? '1st' : data.down === 2 ? '2nd' : data.down === 3 ? '3rd' : '4th'} & {data.distance || '10'}
                </div>
            )}
            
            {/* NBA Bonus */}
            {!isNFL && (data.fouls?.home || 0) >= 5 && (
                <div className="absolute -top-5 bg-yellow-500 text-black px-2 py-0.5 rounded-t font-bold text-[9px]">BONUS</div>
            )}
        </div>

        {/* GUEST */}
        <div className={`px-6 py-2 bg-zinc-900 flex gap-4 items-center relative ${data.possession === 'guest' ? 'bg-zinc-800' : ''}`}>
        {data.possession === 'guest' && <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-yellow-500 animate-pulse"></div>}
        <span className="text-4xl font-black text-yellow-500 font-mono">{data.guestScore}</span>
        <div className="flex flex-col items-end">
            <span className="font-black text-white uppercase text-xl tracking-tight">{data.guestName}</span>
            <div className="flex gap-2 text-[9px] font-bold text-zinc-500 mt-1">
                {isNFL ? (
                    <><span>T.O: {data.timeouts?.guest}</span></>
                ) : (
                    <><span>FOULS: {data.fouls?.guest}</span></>
                )}
            </div>
        </div>
        </div>
    </motion.div>
  );
};

// --- TYPE D: COMBAT (Rounds) ---
const TypeDScoreboard: React.FC<{ data: ScoreState; formattedTime: string; label: string }> = ({ data, formattedTime, label }) => (
    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="absolute bottom-8 left-8 flex items-center bg-black border border-zinc-700 rounded-lg overflow-hidden shadow-2xl z-50">
        <div className="bg-red-800 w-2 h-16"></div>
        <div className="p-3">
            <div className="text-3xl font-bold text-white leading-none font-mono">{formattedTime}</div>
            <div className="text-xs font-bold text-zinc-400 uppercase mt-1">{label} {data.period} <span className="text-zinc-600">/ 5</span></div>
        </div>
    </motion.div>
);

// --- TYPE E: MOTORSPORTS (Leaderboard + Telemetry) ---
const TypeEScoreboard: React.FC<{ data: ScoreState; label: string }> = ({ data, label }) => {
    // Mock Leaderboard Data since we don't have a full array in basic ScoreState
    // In a real app, this would come from `data.extras.leaderboard`
    const drivers = [
        { pos: 1, name: 'VER', time: 'LEADER', team: 'RBR' },
        { pos: 2, name: 'HAM', time: '+1.240', team: 'MER' },
        { pos: 3, name: 'LEC', time: '+2.100', team: 'FER' },
        { pos: 4, name: 'NOR', time: '+5.400', team: 'MCL' },
        { pos: 5, name: 'ALO', time: '+8.100', team: 'AMR' },
    ];

    const flagStatus = data.lastAction?.value === 'yellow' ? 'YELLOW' : data.lastAction?.value === 'red' ? 'RED' : 'GREEN';
    const flagColor = flagStatus === 'YELLOW' ? 'bg-yellow-500 text-black' : flagStatus === 'RED' ? 'bg-red-600 text-white' : 'bg-green-600 text-white';

    return (
        <div className="absolute top-10 left-10 flex flex-col gap-2 z-50 font-sans">
            {/* Header / Lap Counter */}
            <div className="bg-black text-white border-l-4 border-red-600 rounded-r shadow-lg flex">
                <div className={`px-3 py-2 font-bold text-sm flex items-center gap-2 ${flagColor}`}>
                    <Flag size={14} fill="currentColor" /> {flagStatus}
                </div>
                <div className="px-4 py-2 font-mono font-bold text-lg bg-zinc-900 border-r border-zinc-800">
                    LAP {data.period} <span className="text-zinc-500 text-xs">/ 72</span>
                </div>
            </div>

            {/* Leaderboard */}
            <motion.div 
                initial={{ x: -100 }} animate={{ x: 0 }}
                className="bg-black/90 backdrop-blur rounded overflow-hidden border border-zinc-800 w-48"
            >
                {drivers.map((d) => (
                    <div key={d.pos} className="flex items-center text-xs border-b border-zinc-800/50 py-1.5 px-2">
                        <div className="w-6 font-bold text-zinc-400">{d.pos}</div>
                        <div className={`w-1 h-3 mr-2 rounded-sm ${d.team === 'RBR' ? 'bg-blue-800' : d.team === 'FER' ? 'bg-red-600' : d.team === 'MER' ? 'bg-teal-500' : 'bg-orange-500'}`}></div>
                        <div className="flex-1 font-bold text-white">{d.name}</div>
                        <div className="font-mono text-zinc-400">{d.time}</div>
                    </div>
                ))}
            </motion.div>
        </div>
    );
};

// --- GENERIC DISPATCHER ---
const ScoreboardOverlay: React.FC<{ data: ScoreState }> = ({ data }) => {
  const profile = SPORTS_PROFILES[data.sportId] || SPORTS_PROFILES.soccer;
  const m = Math.floor(data.clockSeconds / 60).toString().padStart(2, '0');
  const s = (data.clockSeconds % 60).toString().padStart(2, '0');
  const formatted = `${m}:${s}`;
  const label = profile.periodLabel || 'Per';

  switch(profile.template) {
      case 'type_b': return <TypeBScoreboard data={data} formattedTime={formatted} label={label} sportId={data.sportId} />;
      case 'type_c': return <BaseballScorebug data={data} />;
      case 'type_d': return <TypeDScoreboard data={data} formattedTime={formatted} label={label} />;
      case 'type_e': return <TypeEScoreboard data={data} label={label} />;
      case 'type_a':
      default: return <TypeAScoreboard data={data} formattedTime={formatted} label={label} />;
  }
};

// --- CHAT OVERLAY (V8.4) ---
const ChatOverlay: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const getIcon = (p: string) => {
        switch(p) {
            case 'YOUTUBE': return <Youtube size={20} className="text-red-500"/>;
            case 'TWITCH': return <Twitch size={20} className="text-purple-500"/>;
            case 'FACEBOOK': return <Facebook size={20} className="text-blue-500"/>;
            default: return <MessageSquare size={20} className="text-zinc-500"/>;
        }
    };
    return (
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="absolute bottom-24 left-10 max-w-lg z-50 font-sans"
        >
            <div className="bg-white/95 text-black p-4 rounded-r-xl rounded-tl-xl shadow-2xl border-l-8 border-blue-600 flex gap-4 items-start">
                 <div className="mt-1">{getIcon(message.platform)}</div>
                 <div>
                     <div className="font-bold text-lg text-blue-900 leading-none mb-1">{message.user}</div>
                     <div className="text-xl font-medium leading-tight">{message.text}</div>
                 </div>
            </div>
        </motion.div>
    );
};

// --- COMMERCE OVERLAY (V10 PRO) ---
const CommerceOverlay: React.FC<{ data: any }> = ({ data }) => {
  if (!data) return null;
  const isSoldOut = data.status === 'SOLD_OUT';
  const isLowStock = data.status === 'LOW_STOCK';

  return (
    <motion.div 
       initial={{ y: 150 }}
       animate={{ y: 0 }}
       exit={{ y: 150 }}
       className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl bg-white text-black rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-50 flex overflow-hidden border-2 border-white"
    >
       <div className="w-32 bg-gray-200 relative shrink-0">
           {data.image && <img src={data.image} alt={data.name} className="w-full h-full object-cover" />}
       </div>
       <div className="flex-1 p-3 flex flex-col justify-center">
           <div className="flex items-center gap-2 mb-1">
               <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">On Air Now</span>
               {isLowStock && <span className="bg-amber-500 text-black text-[10px] font-bold px-2 py-0.5 rounded uppercase animate-pulse">Low Stock</span>}
           </div>
           <h2 className="text-2xl font-black leading-none uppercase">{data.name}</h2>
           <p className="text-sm text-gray-600 font-medium truncate">{data.description}</p>
           <div className="flex items-center gap-3 mt-1">
               <span className="text-3xl font-black text-blue-900">{data.price}</span>
           </div>
       </div>
       <div className="w-32 bg-zinc-100 flex flex-col items-center justify-center p-2 border-l border-zinc-200">
           <QrCode size={48} className="text-black mb-1"/>
           <div className="text-[9px] font-bold text-center leading-tight">SCAN TO BUY</div>
       </div>
    </motion.div>
  );
};

// --- ALERT OVERLAY (GAMER V10) ---
const AlertOverlay: React.FC<{ alert: StreamAlert }> = ({ alert }) => (
    <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 1.5, opacity: 0 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center z-[100]"
    >
        <div className="bg-gradient-to-b from-purple-600 to-indigo-900 p-6 rounded-2xl shadow-[0_0_50px_rgba(139,92,246,0.6)] border-4 border-white/20 text-center min-w-[300px]">
            <div className="text-2xl font-black text-white uppercase tracking-widest mb-1">{alert.type}</div>
            <div className="text-4xl font-bold text-yellow-300 mb-2">{alert.user}</div>
        </div>
    </motion.div>
);

// --- MAIN RENDERER ---
interface OverlayRendererProps {
  layers: OverlayLayer[];
  scoreData?: ScoreState;
  chatMessage?: ChatMessage;
  activeAlert?: StreamAlert;
}

export const OverlayRenderer: React.FC<OverlayRendererProps> = ({ layers, scoreData, chatMessage, activeAlert }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <AnimatePresence>
        {activeAlert && <AlertOverlay key={activeAlert.id} alert={activeAlert} />}
        {layers.filter(l => l.visible).sort((a,b) => a.zIndex - b.zIndex).map(layer => {
          switch(layer.type) {
            case 'SCOREBOARD': return scoreData ? <ScoreboardOverlay key={layer.id} data={scoreData} /> : null;
            case 'CHAT_LOWER': return chatMessage ? <ChatOverlay key={layer.id} message={chatMessage} /> : null;
            case 'COMMERCE': return <CommerceOverlay key={layer.id} data={layer.data} />;
            default: return null;
          }
        })}
      </AnimatePresence>
    </div>
  );
};
