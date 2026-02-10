
import React, { useState, useEffect } from 'react';
import { ScoreState, PTZPreset, ChatMessage, ReplayState, Macro, LogEntry, ScenePreset, SwitcherState, AudioChannel, SportProfile, SportAction, RCPState } from '../types';
import { generateEditorialPitch } from '../services/geminiService';
import { DEMO_COMMERCE_PRODUCTS, SPORTS_PROFILES } from '../constants';
import { ScoreboardDesigner } from './ScoreboardDesigner';
import { motion } from 'framer-motion';
import { 
  Play, Square, Scissors, Shuffle, Activity, Mic, Video, ShoppingCart, 
  Bot, AlertTriangle, CheckCircle, Clock, RotateCcw, Clapperboard, 
  Trophy, Coffee, Save, Database, Sliders, MonitorPlay, Radio, List, Edit3, Aperture, Sun, Move, BarChart2, Zap
} from 'lucide-react';

// --- BUTTON COMPONENT ---
export const BroadcastButton: React.FC<{
  label: string;
  active?: boolean;
  color?: 'red' | 'green' | 'blue' | 'zinc' | 'amber' | 'purple';
  onClick: () => void;
  className?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}> = ({ label, active, color = 'zinc', onClick, className = '', icon, disabled }) => {
  const colors = {
    red: active ? 'bg-broadcast-pgm text-white border-red-800 shadow-[0_0_15px_rgba(220,38,38,0.6)]' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border-zinc-700',
    green: active ? 'bg-broadcast-pvw text-white border-green-800 shadow-[0_0_15px_rgba(22,163,74,0.6)]' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border-zinc-700',
    blue: active ? 'bg-blue-600 text-white border-blue-800 shadow-[0_0_15px_rgba(37,99,235,0.6)]' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border-zinc-700',
    amber: active ? 'bg-amber-600 text-white border-amber-800 shadow-[0_0_15px_rgba(217,119,6,0.6)]' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border-zinc-700',
    purple: active ? 'bg-purple-600 text-white border-purple-800 shadow-[0_0_15px_rgba(147,51,234,0.6)]' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border-zinc-700',
    zinc: active ? 'bg-zinc-100 text-black border-zinc-300' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border-zinc-700',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={`relative flex items-center justify-center gap-2 px-4 py-3 rounded font-bold transition-colors duration-100 border-b-2 disabled:opacity-50 disabled:pointer-events-none ${colors[color]} ${className}`}
    >
      {icon}
      {label}
      {active && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-white animate-pulse-fast"></span>}
    </motion.button>
  );
};

// --- RCP CONTROL MODULE ---
const RCPSlider: React.FC<{ label: string; value: number; min?: number; max?: number; onChange: (v: number) => void }> = ({ label, value, min = 0, max = 100, onChange }) => (
    <div className="flex flex-col gap-1 w-full">
        <div className="flex justify-between text-[9px] text-zinc-400 font-bold uppercase">
            <span>{label}</span>
            <span>{value}</span>
        </div>
        <input 
            type="range" min={min} max={max} value={value} 
            onChange={e => onChange(Number(e.target.value))}
            className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
    </div>
);

export const RCPControl: React.FC<{ 
    state: RCPState; 
    onUpdate: (key: keyof RCPState, val: number) => void;
    camId: string;
    onSelectCam: (id: string) => void;
}> = ({ state, onUpdate, camId, onSelectCam }) => {
    return (
        <div className="bg-zinc-900 p-2 rounded border border-zinc-800 h-full flex flex-col gap-2">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                <div className="flex items-center gap-2">
                    <Aperture size={14} className="text-purple-500"/>
                    <span className="text-xs font-bold text-white">RCP SHADING</span>
                </div>
                <div className="flex gap-1">
                    {['cam1','cam2','cam3'].map(id => (
                        <button key={id} onClick={() => onSelectCam(id)} className={`text-[9px] px-2 py-1 rounded font-bold ${camId === id ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                            {id.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4 overflow-y-auto no-scrollbar content-start">
                <RCPSlider label="IRIS" value={state.iris} onChange={v => onUpdate('iris', v)} />
                <RCPSlider label="GAIN (dB)" value={state.gain} onChange={v => onUpdate('gain', v)} />
                <RCPSlider label="SHUTTER" value={state.shutter} onChange={v => onUpdate('shutter', v)} />
                <RCPSlider label="WHITE BAL (K)" value={state.whiteBalance} min={2000} max={10000} onChange={v => onUpdate('whiteBalance', v)} />
                <RCPSlider label="BLACK LVL" value={state.blackLevel} min={-50} max={50} onChange={v => onUpdate('blackLevel', v)} />
                <RCPSlider label="FOCUS" value={state.focus} onChange={v => onUpdate('focus', v)} />
            </div>
        </div>
    );
};

// --- DYNAMIC SCOREBOARD CONTROLLER (V10 PRO) ---
export const ScoreboardController: React.FC<{
  data: ScoreState;
  profile: SportProfile;
  onAction: (action: SportAction) => void;
  onUpdateRaw: (updates: Partial<ScoreState>) => void;
  onLoadSport: (id: string) => void;
  formattedTime: string;
}> = ({ data, profile, onAction, onUpdateRaw, onLoadSport, formattedTime }) => {
  const [showSelector, setShowSelector] = useState(false);
  const [activeTab, setActiveTab] = useState<'main' | 'stats' | 'flow'>('main');

  const getActions = (group: string) => profile.actions.filter(a => a.group === group || (!a.group && group === 'main'));

  return (
    <div className="bg-zinc-900 p-2 rounded border border-zinc-800 h-full flex flex-col gap-2 shadow-lg relative">
      
      {/* Sport Selector Modal */}
      {showSelector && (
         <div className="absolute inset-0 bg-zinc-950/95 z-50 flex flex-col p-4 overflow-y-auto rounded-lg">
            <div className="flex justify-between items-center mb-4 border-b border-zinc-800 pb-2">
               <h3 className="text-sm font-bold text-white flex items-center gap-2 tracking-widest uppercase"><Zap size={14} className="text-yellow-500"/> Sports Engine</h3>
               <button onClick={() => setShowSelector(false)} className="text-red-500 font-bold text-xs uppercase hover:bg-red-900/20 px-2 py-1 rounded">Close</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
                {Object.values(SPORTS_PROFILES).map(p => (
                <button 
                  key={p.id} 
                  onClick={() => { onLoadSport(p.id); setShowSelector(false); }} 
                  className={`text-left p-3 border rounded-lg transition-all ${data.sportId === p.id ? 'bg-blue-900 border-blue-500 shadow-lg' : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300'}`}
                >
                    <div className="font-black text-white uppercase text-xs">{p.name}</div>
                    <div className="text-[8px] uppercase opacity-50 font-mono tracking-tighter">{p.type}</div>
                </button>
                ))}
            </div>
         </div>
      )}

      {/* Header / Primary Data Bar */}
      <div className="flex justify-between items-center bg-black p-3 rounded-lg border border-zinc-800 shrink-0">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setShowSelector(true)}>
           <div className="bg-zinc-800 p-1.5 rounded-full group-hover:bg-blue-600 transition-colors">
              <List size={16} className="text-blue-500 group-hover:text-white" />
           </div>
           <div className="flex flex-col">
              <span className="text-[10px] font-black text-zinc-500 uppercase leading-none tracking-widest">{data.sportId}</span>
              <span className="text-sm font-black text-white uppercase truncate max-w-[100px]">{profile.name}</span>
           </div>
        </div>

        <div className="flex gap-4 items-center">
             {/* Special Mode Display (Shot Clock / Service / Rest) */}
             {profile.hasShotClock && (
               <div className={`px-4 py-1 rounded border-2 font-mono font-bold text-2xl leading-none flex flex-col items-center ${data.shotClockSeconds < 5 ? 'bg-red-900 border-red-500 text-white animate-pulse' : 'bg-zinc-900 border-amber-500 text-amber-500'}`}>
                  <span className="text-[8px] font-sans font-bold uppercase mb-0.5">Shot Clock</span>
                  {data.shotClockSeconds}
               </div>
             )}
             
             {data.isRestPeriod && (
                <div className="px-4 py-1 bg-blue-900 border-2 border-blue-500 rounded text-white font-bold flex flex-col items-center animate-pulse">
                   <span className="text-[8px] uppercase">REST</span>
                   <span className="text-xl font-mono">{Math.floor(data.clockSeconds/60)}:{(data.clockSeconds%60).toString().padStart(2,'0')}</span>
                </div>
             )}

             <div className="flex flex-col items-center border-l border-zinc-800 pl-4">
                <div className={`text-3xl font-black font-mono leading-none tracking-tighter ${data.timerRunning ? 'text-green-500' : 'text-zinc-700'}`}>
                    {formattedTime}
                </div>
                <button 
                  onClick={() => onUpdateRaw({timerRunning: !data.timerRunning})} 
                  className={`mt-1 text-[10px] font-black uppercase tracking-tighter px-3 py-0.5 rounded ${data.timerRunning ? 'bg-red-900/50 text-red-500 hover:bg-red-900' : 'bg-green-900/50 text-green-500 hover:bg-green-900'}`}
                >
                    {data.timerRunning ? 'PAUSE CLOCK' : 'START CLOCK'}
                </button>
            </div>
        </div>
      </div>

      {/* TABS FOR MASSIVE BUTTONS */}
      <div className="flex gap-1 shrink-0 bg-zinc-950 p-1 rounded-lg">
          {['main', 'flow', 'stats'].map((t) => (
             <button 
               key={t}
               onClick={() => setActiveTab(t as any)} 
               className={`flex-1 py-1 rounded text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-zinc-100 text-black shadow-inner' : 'text-zinc-600 hover:text-zinc-300'}`}
             >
                {t}
             </button>
          ))}
          {profile.hasShotClock && (
             <button onClick={() => setActiveTab('shot_clock')} className={`px-4 py-1 rounded text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'shot_clock' ? 'bg-amber-500 text-black' : 'text-amber-500/50 hover:text-amber-500'}`}>
                SC
             </button>
          )}
      </div>

      {/* Main Scoring Area: MASSIVE TOUCH BUTTONS */}
      <div className="flex-1 flex gap-3 min-h-0">
         {/* Home Col */}
         <div className={`flex-1 flex flex-col gap-2 p-2 rounded-xl border-2 transition-all ${data.serviceSide === 'home' ? 'bg-blue-900/20 border-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.2)]' : 'bg-zinc-950 border-zinc-800'}`}>
            <div className="flex justify-between items-center mb-1">
               <input 
                  value={data.homeName} 
                  onChange={e => onUpdateRaw({homeName: e.target.value})}
                  className="bg-transparent text-xs font-black text-blue-400 outline-none w-full uppercase tracking-widest"
               />
               {profile.hasSets && <div className="text-xs font-black bg-blue-600 text-white px-2 py-0.5 rounded ml-2">{data.sets?.home} Sets</div>}
            </div>
            <div className="text-6xl font-black font-mono text-center text-white my-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{data.homeScore}</div>
            
            {/* Dynamic Buttons */}
            <div className="flex-1 overflow-y-auto no-scrollbar grid grid-cols-1 gap-2 content-start">
               {getActions(activeTab).filter(a => a.target === 'home').map(action => (
                  <button 
                     key={action.id} 
                     onClick={() => onAction(action)}
                     className={`text-xs font-black py-6 rounded-xl border-b-4 transition-all active:scale-95 active:border-b-0 active:translate-y-1 ${action.color === 'blue' ? 'bg-blue-600 border-blue-800 text-white' : action.color === 'amber' ? 'bg-amber-600 border-amber-800 text-white' : 'bg-zinc-800 border-zinc-900 text-zinc-300'}`}
                  >
                     {action.label}
                  </button>
               ))}
            </div>
         </div>

         {/* Guest Col */}
         <div className={`flex-1 flex flex-col gap-2 p-2 rounded-xl border-2 transition-all ${data.serviceSide === 'guest' ? 'bg-red-900/20 border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.2)]' : 'bg-zinc-950 border-zinc-800'}`}>
            <div className="flex justify-between items-center mb-1">
               <input 
                  value={data.guestName} 
                  onChange={e => onUpdateRaw({guestName: e.target.value})}
                  className="bg-transparent text-xs font-black text-red-400 outline-none w-full uppercase tracking-widest"
               />
               {profile.hasSets && <div className="text-xs font-black bg-red-600 text-white px-2 py-0.5 rounded ml-2">{data.sets?.guest} Sets</div>}
            </div>
            <div className="text-6xl font-black font-mono text-center text-white my-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{data.guestScore}</div>
            <div className="flex-1 overflow-y-auto no-scrollbar grid grid-cols-1 gap-2 content-start">
               {getActions(activeTab).filter(a => a.target === 'guest').map(action => (
                  <button 
                     key={action.id} 
                     onClick={() => onAction(action)}
                     className={`text-xs font-black py-6 rounded-xl border-b-4 transition-all active:scale-95 active:border-b-0 active:translate-y-1 ${action.color === 'red' ? 'bg-red-600 border-red-800 text-white' : action.color === 'amber' ? 'bg-amber-600 border-amber-800 text-white' : 'bg-zinc-800 border-zinc-900 text-zinc-300'}`}
                  >
                     {action.label}
                  </button>
               ))}
            </div>
         </div>
      </div>
      
      {/* Shared Actions Footer */}
      <div className="grid grid-cols-3 gap-2 shrink-0">
          {getActions(activeTab).filter(a => !a.target && a.type !== 'period').map(act => (
             <button 
                key={act.id} 
                onClick={() => onAction(act)} 
                className={`text-[10px] font-black rounded-lg py-3 border-b-2 transition-all uppercase ${act.color === 'green' ? 'bg-green-600 border-green-800 text-white' : act.color === 'amber' ? 'bg-amber-600 border-amber-800 text-white' : 'bg-zinc-800 border-zinc-900 text-zinc-400'}`}
             >
                {act.label}
             </button>
          ))}
          {/* Period Control persists */}
          <div className="flex items-center justify-between bg-zinc-950 rounded-lg border border-zinc-800 px-3 py-1">
             <button onClick={() => onAction({type: 'period', value: -1, id:'p-', label:'-'})} className="text-zinc-600 hover:text-white p-2 font-black text-lg">-</button>
             <div className="flex flex-col items-center">
                <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest leading-none">{profile.periodLabel || 'PER'}</span>
                <span className="font-black text-white text-xl leading-none">{data.period}</span>
             </div>
             <button onClick={() => onAction({type: 'period', value: 1, id:'p+', label:'+'})} className="text-zinc-600 hover:text-white p-2 font-black text-lg">+</button>
          </div>
      </div>
    </div>
  );
};
