
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pad, MediaItem, ScenePreset, Macro } from '../types';
import { VIRTUAL_PADS, MEDIA_LIBRARY } from '../constants';
import { BroadcastButton } from './Modules';
import { Grid, Music, Mic2, Clapperboard, Layers, Save, Sliders, Folder } from 'lucide-react';

// --- SUB-COMPONENTS ---

const PadsGrid: React.FC<{ pads: Pad[], onTrigger: (p: Pad) => void }> = ({ pads, onTrigger }) => (
  <div className="grid grid-cols-4 gap-2 h-full overflow-y-auto no-scrollbar p-1">
     {pads.map(pad => (
        <BroadcastButton 
           key={pad.id}
           label={pad.label}
           color={pad.color}
           onClick={() => onTrigger(pad)}
           className="h-full min-h-[60px] text-[10px] flex-col gap-1 shadow-lg"
           // @ts-ignore
           icon={<Grid size={16} />} 
        />
     ))}
  </div>
);

const MediaBrowser: React.FC<{ media: MediaItem[] }> = ({ media }) => (
  <div className="h-full flex flex-col bg-black rounded border border-zinc-800 overflow-hidden">
     <div className="flex items-center px-2 py-1 bg-zinc-900 border-b border-zinc-800 text-[10px] text-zinc-500 font-bold uppercase">
        <span className="w-8">Type</span>
        <span className="flex-1">Name</span>
        <span className="w-12 text-right">Dur</span>
     </div>
     <div className="flex-1 overflow-y-auto no-scrollbar">
        {media.map(m => (
           <div key={m.id} className="flex items-center px-2 py-2 border-b border-zinc-900 hover:bg-zinc-800 cursor-pointer text-xs text-zinc-300 group">
              <span className="w-8 flex justify-center">
                 {m.type === 'VIDEO' ? <Clapperboard size={12} className="text-blue-500"/> : m.type === 'AUDIO' ? <Music size={12} className="text-green-500"/> : <Layers size={12} className="text-amber-500"/>}
              </span>
              <span className="flex-1 font-bold group-hover:text-white truncate">{m.title}</span>
              <span className="w-12 text-right font-mono text-zinc-500">{m.duration}</span>
           </div>
        ))}
     </div>
  </div>
);

const QuickFX: React.FC = () => (
  <div className="h-full grid grid-cols-4 gap-2 p-1">
     <BroadcastButton label="FADE TO BLACK" color="red" onClick={() => {}} className="h-full text-[9px] flex-col" />
     <BroadcastButton label="MIC DUCK" color="amber" onClick={() => {}} className="h-full text-[9px] flex-col" />
     <BroadcastButton label="AUDIO ONLY" color="blue" onClick={() => {}} className="h-full text-[9px] flex-col" />
     <BroadcastButton label="TEST TONE" color="zinc" onClick={() => {}} className="h-full text-[9px] flex-col" />
  </div>
);

// --- MAIN COMPONENT ---

export const VirtualDeck: React.FC<{
  macros: Macro[];
  onExecuteMacro: (m: Macro) => void;
}> = ({ macros, onExecuteMacro }) => {
  const [activeTab, setActiveTab] = useState<'PADS' | 'BROWSER' | 'FX'>('PADS');

  // Map generic pads to macros for demo
  const handlePadTrigger = (pad: Pad) => {
     // Find corresponding macro if exists
     const macro = macros.find(m => m.id === pad.actionId);
     if (macro) onExecuteMacro(macro);
     else console.log("Pad trigger:", pad.id);
  };

  return (
    <div className="h-full flex flex-col bg-zinc-900 border border-zinc-800 rounded overflow-hidden shadow-xl">
       {/* Tab Headers (VirtualDJ Style) */}
       <div className="flex h-8 bg-zinc-950 border-b border-zinc-800">
          <button 
            onClick={() => setActiveTab('PADS')}
            className={`flex-1 flex items-center justify-center gap-2 text-[10px] font-bold uppercase border-r border-zinc-800 transition-colors ${activeTab === 'PADS' ? 'bg-zinc-800 text-white border-b-2 border-b-blue-500' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
             <Grid size={12} /> PADS
          </button>
          <button 
            onClick={() => setActiveTab('BROWSER')}
            className={`flex-1 flex items-center justify-center gap-2 text-[10px] font-bold uppercase border-r border-zinc-800 transition-colors ${activeTab === 'BROWSER' ? 'bg-zinc-800 text-white border-b-2 border-b-amber-500' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
             <Folder size={12} /> BROWSER
          </button>
          <button 
            onClick={() => setActiveTab('FX')}
            className={`flex-1 flex items-center justify-center gap-2 text-[10px] font-bold uppercase border-r border-zinc-800 transition-colors ${activeTab === 'FX' ? 'bg-zinc-800 text-white border-b-2 border-b-red-500' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
             <Sliders size={12} /> QUICK FX
          </button>
       </div>

       {/* Content Area */}
       <div className="flex-1 bg-broadcast-surface p-1 relative overflow-hidden">
          <AnimatePresence mode="wait">
             <motion.div 
               key={activeTab}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               transition={{ duration: 0.15 }}
               className="h-full"
             >
                {activeTab === 'PADS' && <PadsGrid pads={VIRTUAL_PADS} onTrigger={handlePadTrigger} />}
                {activeTab === 'BROWSER' && <MediaBrowser media={MEDIA_LIBRARY} />}
                {activeTab === 'FX' && <QuickFX />}
             </motion.div>
          </AnimatePresence>
       </div>
    </div>
  );
};
