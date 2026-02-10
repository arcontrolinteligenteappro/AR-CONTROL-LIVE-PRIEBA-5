
import React, { useState, useEffect } from 'react';
import { AudioChannel, AudioDynamics, EQ5Band, DSPConfig, AudioRouting } from '../types';
import { AudioDeviceModal } from './AudioDeviceModal';
import { motion } from 'framer-motion';
import { Mic, Video, Volume2, Headphones, Settings2, X, Activity, Sliders, ArrowRight, Cpu, HardDrive, Route, Radio, Cast, Ear } from 'lucide-react';

interface AudioMixerProps {
  channels: AudioChannel[];
  onUpdateChannel: (id: string, updates: Partial<AudioChannel>) => void;
}

// --- CHANNEL SETTINGS MODAL (V8.6 PRO) ---
const ChannelSettingsModal: React.FC<{ channel: AudioChannel; onClose: () => void; onUpdate: (u: Partial<AudioChannel>) => void }> = ({ channel, onClose, onUpdate }) => {
    
    const updateDyn = (key: keyof AudioDynamics, subKey: string, val: any) => {
        const newDyn = { ...channel.dynamics, [key]: { ...channel.dynamics[key as keyof AudioDynamics], [subKey]: val } };
        onUpdate({ dynamics: newDyn });
    };

    const updateEQ = (key: keyof EQ5Band, val: number) => {
        onUpdate({ eq: { ...channel.eq, [key]: val } });
    };

    const updateDSP = (key: keyof DSPConfig, val: number) => {
        onUpdate({ dsp: { ...channel.dsp, [key]: val } });
    };

    const updateRouting = (key: keyof AudioRouting) => {
        onUpdate({ routing: { ...channel.routing, [key]: !channel.routing[key] } });
    }

    return (
        <div className="absolute inset-0 bg-zinc-950/95 z-[100] flex flex-col animate-in fade-in duration-200">
            {/* Header */}
            <div className="flex justify-between items-center p-3 border-b border-zinc-800 bg-zinc-900">
                <div className="flex items-center gap-2">
                    <Settings2 size={18} className="text-blue-500"/>
                    <span className="text-lg font-bold text-white uppercase tracking-wider">{channel.label} <span className="text-zinc-500">DSP CHAIN</span></span>
                </div>
                <button onClick={onClose} className="bg-zinc-800 p-1.5 rounded text-zinc-400 hover:text-white"><X size={18}/></button>
            </div>

            {/* Signal Chain Visualization */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                
                {/* 0. ROUTING MATRIX (New) */}
                <div className="bg-black/40 rounded border border-zinc-700 p-3 relative">
                    <div className="absolute top-0 right-0 px-2 py-1 bg-zinc-800 text-[9px] font-bold text-zinc-500 rounded-bl">ROUTING</div>
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-bold text-white flex items-center gap-2"><Route size={14}/> SIGNAL ROUTING</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        <RoutingToggle label="MASTER" icon={<Volume2 size={12}/>} active={channel.routing.toMaster} onClick={() => updateRouting('toMaster')} color="red" />
                        <RoutingToggle label="STREAM" icon={<Cast size={12}/>} active={channel.routing.toStream} onClick={() => updateRouting('toStream')} color="blue" />
                        <RoutingToggle label="MONITOR" icon={<Headphones size={12}/>} active={channel.routing.toMonitor} onClick={() => updateRouting('toMonitor')} color="green" />
                        <RoutingToggle label="AUX (N-1)" icon={<Ear size={12}/>} active={channel.routing.toAux} onClick={() => updateRouting('toAux')} color="amber" />
                    </div>
                </div>

                <div className="flex justify-center"><ArrowRight size={16} className="text-zinc-700 rotate-90"/></div>

                {/* 1. INPUT GAIN & DELAY (Pre-Amp) */}
                <div className="bg-zinc-900 rounded border border-zinc-800 p-3 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 px-2 py-1 bg-zinc-800 text-[9px] font-bold text-zinc-500 rounded-bl">STAGE 1</div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-white flex items-center gap-2"><Mic size={14}/> INPUT / DELAY</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <RangeParam label="Input Gain" value={channel.gain} min={-18} max={18} unit="dB" onChange={e => onUpdate({gain: e})} color="yellow" />
                        </div>
                        <div>
                            <RangeParam label="Sync Delay" value={channel.dsp.delayMs} min={0} max={500} unit="ms" onChange={e => updateDSP('delayMs', e)} color="purple" />
                        </div>
                    </div>
                </div>

                <div className="flex justify-center"><ArrowRight size={16} className="text-zinc-700 rotate-90"/></div>

                {/* 2. NOISE GATE */}
                <div className="bg-zinc-900 rounded border border-zinc-800 p-3 relative">
                    <div className="absolute top-0 right-0 px-2 py-1 bg-zinc-800 text-[9px] font-bold text-zinc-500 rounded-bl">STAGE 2</div>
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-bold text-white flex items-center gap-2"><Activity size={14}/> NOISE GATE</span>
                        <Toggle active={channel.dynamics.gate.active} onClick={() => updateDyn('gate', 'active', !channel.dynamics.gate.active)} />
                    </div>
                    <RangeParam label="Threshold" value={channel.dynamics.gate.threshold} min={-80} max={0} unit="dB" onChange={v => updateDyn('gate', 'threshold', v)} color="green" />
                </div>

                <div className="flex justify-center"><ArrowRight size={16} className="text-zinc-700 rotate-90"/></div>

                {/* 3. 5-BAND EQUALIZER */}
                <div className="bg-zinc-900 rounded border border-zinc-800 p-3 relative">
                    <div className="absolute top-0 right-0 px-2 py-1 bg-zinc-800 text-[9px] font-bold text-zinc-500 rounded-bl">STAGE 3</div>
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-bold text-white flex items-center gap-2"><Sliders size={14}/> 5-BAND EQ</span>
                    </div>
                    <div className="space-y-4">
                        <div className="flex gap-2 items-center bg-black/20 p-2 rounded border border-zinc-800/50">
                            <span className="text-[10px] text-zinc-400 w-16">LC (HPF)</span>
                            <input type="range" min={20} max={500} value={channel.eq.lowCut} onChange={e => updateEQ('lowCut', Number(e.target.value))} className="flex-1 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-zinc-400" />
                            <span className="text-[10px] font-mono text-white w-10 text-right">{channel.eq.lowCut}Hz</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-center">
                            <EQKnob label="LOW" value={channel.eq.low} onChange={v => updateEQ('low', v)} sub="Shelf" />
                            <EQKnob label="LO-MID" value={channel.eq.lowMid} onChange={v => updateEQ('lowMid', v)} sub="Peak" />
                            <EQKnob label="HI-MID" value={channel.eq.highMid} onChange={v => updateEQ('highMid', v)} sub="Peak" />
                            <EQKnob label="HIGH" value={channel.eq.high} onChange={v => updateEQ('high', v)} sub="Shelf" />
                        </div>
                    </div>
                </div>

                <div className="flex justify-center"><ArrowRight size={16} className="text-zinc-700 rotate-90"/></div>

                {/* 4. COMPRESSOR */}
                <div className="bg-zinc-900 rounded border border-zinc-800 p-3 relative">
                    <div className="absolute top-0 right-0 px-2 py-1 bg-zinc-800 text-[9px] font-bold text-zinc-500 rounded-bl">STAGE 4</div>
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-bold text-white flex items-center gap-2"><Activity size={14}/> COMPRESSOR</span>
                        <Toggle active={channel.dynamics.compressor.active} onClick={() => updateDyn('compressor', 'active', !channel.dynamics.compressor.active)} />
                    </div>
                    <div className="space-y-3">
                        <RangeParam label="Threshold" value={channel.dynamics.compressor.threshold} min={-60} max={0} unit="dB" onChange={v => updateDyn('compressor', 'threshold', v)} color="blue" />
                        <RangeParam label="Ratio" value={channel.dynamics.compressor.ratio} min={1} max={20} unit=":1" onChange={v => updateDyn('compressor', 'ratio', v)} color="blue" />
                        <div className="grid grid-cols-2 gap-4">
                            <RangeParam label="Attack" value={channel.dynamics.compressor.attack} min={0} max={100} unit="ms" onChange={v => updateDyn('compressor', 'attack', v)} color="zinc" />
                            <RangeParam label="Release" value={channel.dynamics.compressor.release} min={10} max={1000} unit="ms" onChange={v => updateDyn('compressor', 'release', v)} color="zinc" />
                        </div>
                    </div>
                </div>

                <div className="flex justify-center"><ArrowRight size={16} className="text-zinc-700 rotate-90"/></div>

                {/* 5. LIMITER (Safety) */}
                <div className="bg-zinc-900 rounded border border-zinc-800 p-3 relative">
                    <div className="absolute top-0 right-0 px-2 py-1 bg-zinc-800 text-[9px] font-bold text-zinc-500 rounded-bl">STAGE 5</div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-white flex items-center gap-2"><Activity size={14}/> LIMITER</span>
                        <Toggle active={channel.dynamics.limiter.active} onClick={() => updateDyn('limiter', 'active', !channel.dynamics.limiter.active)} />
                    </div>
                    <div className="flex gap-2 items-center">
                        <span className="text-[10px] text-zinc-400">Ceiling</span>
                        <div className="h-1 flex-1 bg-zinc-700 rounded overflow-hidden">
                            <div className="h-full bg-red-600 w-full opacity-50"></div>
                        </div>
                        <span className="text-[10px] font-mono text-red-500">-1.0dB</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- SUB COMPONENTS ---

const RoutingToggle: React.FC<{ label: string; icon: React.ReactNode; active: boolean; onClick: () => void; color: string }> = ({ label, icon, active, onClick, color }) => (
    <button 
        onClick={onClick}
        className={`flex flex-col items-center justify-center p-2 rounded border transition-all ${active ? `bg-${color}-900/50 border-${color}-600 text-white` : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}
    >
        <div className={`mb-1 ${active ? `text-${color}-400` : ''}`}>{icon}</div>
        <span className="text-[8px] font-bold">{label}</span>
    </button>
);

const Toggle: React.FC<{ active: boolean; onClick: () => void }> = ({ active, onClick }) => (
    <button onClick={onClick} className={`w-8 h-4 rounded-full p-0.5 transition-colors ${active ? 'bg-green-500' : 'bg-zinc-700'}`}>
        <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${active ? 'translate-x-4' : 'translate-x-0'}`}></div>
    </button>
);

const RangeParam: React.FC<{ label: string; value: number; min: number; max: number; unit: string; onChange: (v: number) => void; color?: string }> = ({ label, value, min, max, unit, onChange, color='zinc' }) => (
    <div>
        <div className="flex justify-between text-[10px] mb-1">
            <span className="text-zinc-400">{label}</span>
            <span className={`font-mono text-${color}-400`}>{value}{unit}</span>
        </div>
        <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))} className={`w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-${color}-500`} />
    </div>
);

const EQKnob: React.FC<{ label: string; value: number; onChange: (v: number) => void; sub: string }> = ({ label, value, onChange, sub }) => (
    <div className="flex flex-col items-center gap-1">
        <div className="relative w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full" style={{ transform: `rotate(${(value / 12) * 135}deg)` }}>
                <div className="w-1 h-1.5 bg-white mx-auto mt-1 rounded-full"></div>
            </div>
            <input 
                type="range" min={-12} max={12} value={value} 
                onChange={e => onChange(Number(e.target.value))}
                className="absolute inset-0 opacity-0 cursor-ns-resize"
                title={`${label}: ${value}dB`}
            />
        </div>
        <div className="flex flex-col">
            <span className="text-[9px] font-bold text-zinc-300">{label}</span>
            <span className="text-[7px] text-zinc-500">{sub}</span>
        </div>
    </div>
);

// --- CHANNEL STRIP COMPONENT ---
const ChannelStrip: React.FC<{ 
  channel: AudioChannel; 
  onUpdate: (u: Partial<AudioChannel>) => void; 
  isMaster?: boolean;
  onOpenDSP: () => void;
}> = ({ channel, onUpdate, isMaster, onOpenDSP }) => {
  const [meterLevel, setMeterLevel] = useState(0);

  useEffect(() => {
    if (channel.muted) {
      setMeterLevel(0);
      return;
    }
    const interval = setInterval(() => {
      const jitter = (Math.random() - 0.5) * 5;
      const base = channel.peak > 0 ? channel.peak : (channel.level * 0.8); 
      setMeterLevel(Math.max(0, Math.min(100, base + jitter)));
    }, 50);
    return () => clearInterval(interval);
  }, [channel.peak, channel.level, channel.muted]);

  return (
    <div className={`flex flex-col items-center h-full ${isMaster ? 'bg-zinc-900/80 border-l border-zinc-800 px-3 min-w-[90px]' : 'px-1 border-r border-zinc-800/50 min-w-[70px] max-w-[80px]'}`}>
      
      {/* 1. INPUT CONFIG */}
      {!isMaster && (
        <div className="flex flex-col gap-1.5 mb-2 w-full items-center">
           {/* Gain / Pan Mini */}
           <div className="flex justify-between w-full px-1">
               <div className="flex flex-col items-center">
                   <div className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center relative">
                        <div className="w-0.5 h-1.5 bg-red-400 absolute top-0.5" style={{ transformOrigin: 'bottom center', transform: `rotate(${(channel.gain/18)*135}deg)` }}></div>
                        <input type="range" min={-18} max={18} value={channel.gain} onChange={e=>onUpdate({gain: Number(e.target.value)})} className="absolute inset-0 opacity-0"/>
                   </div>
                   <span className="text-[6px] text-zinc-500">GAIN</span>
               </div>
               <div className="flex flex-col items-center">
                   <div className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center relative">
                        <div className="w-0.5 h-1.5 bg-blue-400 absolute top-0.5" style={{ transformOrigin: 'bottom center', transform: `rotate(${(channel.pan/50)*135}deg)` }}></div>
                        <input type="range" min={-50} max={50} value={channel.pan} onChange={e=>onUpdate({pan: Number(e.target.value)})} className="absolute inset-0 opacity-0"/>
                   </div>
                   <span className="text-[6px] text-zinc-500">PAN</span>
               </div>
           </div>
           
           {/* DSP Toggle */}
           <button onClick={onOpenDSP} className="text-[7px] bg-zinc-800 border border-zinc-700 px-2 py-1 rounded text-blue-400 font-bold hover:text-white hover:bg-blue-600 w-full flex justify-center gap-1 transition-colors">
               <Settings2 size={8}/> DSP CHAIN
           </button>
        </div>
      )}

      {/* 2. MUTE / SOLO */}
      <div className="flex flex-col gap-1 w-full mb-2 px-1">
         <button 
           onClick={() => onUpdate({ solo: !channel.solo })}
           className={`text-[8px] font-bold py-1 px-1 rounded border transition-colors ${channel.solo ? 'bg-yellow-500 text-black border-yellow-600' : 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}
         >
           SOLO
         </button>
         <button 
           onClick={() => onUpdate({ muted: !channel.muted })}
           className={`text-[8px] font-bold py-2 px-1 rounded border transition-colors ${channel.muted ? 'bg-red-600 text-white border-red-500 shadow-[0_0_10px_rgba(220,38,38,0.5)]' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}
         >
           {channel.muted ? 'MUTE' : 'ON'}
         </button>
      </div>

      {/* 3. FADER AREA */}
      <div className="flex-1 relative w-10 bg-zinc-950 rounded-lg my-1 border border-zinc-800 flex justify-center py-2">
         {/* Grid lines */}
         <div className="absolute inset-0 flex flex-col justify-between py-2 px-3 pointer-events-none opacity-20">
            {[...Array(10)].map((_, i) => <div key={i} className="w-full h-[1px] bg-zinc-500"></div>)}
         </div>

         {/* Meter */}
         <div className="absolute left-1 bottom-2 top-2 w-1.5 bg-zinc-900 rounded-full overflow-hidden">
            <div 
               className={`absolute bottom-0 w-full transition-all duration-75 ease-out ${meterLevel > 90 ? 'bg-red-500' : meterLevel > 75 ? 'bg-yellow-500' : 'bg-green-500'}`}
               style={{ height: `${meterLevel}%` }}
            />
         </div>
         
         {/* Fader Track */}
         <div className="relative h-full w-2 bg-black rounded-full ml-3 group">
             {/* Thumb */}
             <motion.div 
               className={`absolute left-1/2 -translate-x-1/2 w-8 h-10 rounded shadow-lg flex items-center justify-center border-t border-b border-zinc-400 cursor-grab active:cursor-grabbing ${isMaster ? 'bg-red-900' : 'bg-zinc-700 group-hover:bg-zinc-600'}`}
               style={{ bottom: `calc(${channel.level}% - 20px)` }}
               drag="y"
               dragConstraints={{ top: 0, bottom: 0 }} 
               dragElastic={0}
             >
               <div className="w-6 h-[1px] bg-white opacity-50"></div>
             </motion.div>
         </div>

         <input 
          type="range" min="0" max="100" value={channel.level} 
          onChange={(e) => onUpdate({ level: Number(e.target.value) })}
          className="absolute inset-0 w-full h-full opacity-0 cursor-ns-resize z-30"
          style={{ appearance: 'slider-vertical' as any }} 
         />
      </div>

      {/* 4. LABEL */}
      <div className="mt-2 w-full text-center bg-zinc-900 border border-zinc-800 rounded py-1 px-0.5">
         <div className="text-[8px] font-bold text-white truncate">{channel.label}</div>
         <div className="text-[7px] font-mono text-zinc-500">{channel.level > 0 ? (channel.level - 80) + 'dB' : '-INF'}</div>
      </div>
    </div>
  );
};

const AudioMixer: React.FC<AudioMixerProps> = ({ channels, onUpdateChannel }) => {
  const master = channels.find(c => c.id === 'master');
  const inputs = channels.filter(c => c.id !== 'master');
  const [dspChannelId, setDspChannelId] = useState<string | null>(null);
  const [showDeviceManager, setShowDeviceManager] = useState(false);

  const dspChannel = channels.find(c => c.id === dspChannelId);

  return (
    <div className="relative h-full w-full flex flex-col">
        {dspChannel && (
            <ChannelSettingsModal 
                channel={dspChannel} 
                onClose={() => setDspChannelId(null)}
                onUpdate={(u) => onUpdateChannel(dspChannel.id, u)}
            />
        )}
        {showDeviceManager && <AudioDeviceModal onClose={() => setShowDeviceManager(false)} />}
        
        {/* Device Manager Access Bar */}
        <div className="h-6 bg-zinc-950 border-b border-zinc-800 flex justify-between items-center px-2 shrink-0">
            <span className="text-[9px] font-bold text-zinc-500">AUDIO ENGINE</span>
            <button onClick={() => setShowDeviceManager(true)} className="flex items-center gap-1 text-[9px] bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-blue-400 px-2 rounded">
               <HardDrive size={10} /> <span>DEVICE MANAGER</span>
            </button>
        </div>

        <div className="flex flex-1 w-full bg-zinc-950 rounded-b border border-t-0 border-zinc-800 overflow-x-auto no-scrollbar py-2">
            {inputs.map(ch => (
                <ChannelStrip 
                    key={ch.id} 
                    channel={ch} 
                    onUpdate={(u) => onUpdateChannel(ch.id, u)}
                    onOpenDSP={() => setDspChannelId(ch.id)}
                />
            ))}
            {master && (
                <ChannelStrip 
                    key="master" 
                    channel={master} 
                    isMaster 
                    onUpdate={(u) => onUpdateChannel('master', u)}
                    onOpenDSP={() => setDspChannelId('master')}
                />
            )}
        </div>
    </div>
  );
};

export default AudioMixer;
