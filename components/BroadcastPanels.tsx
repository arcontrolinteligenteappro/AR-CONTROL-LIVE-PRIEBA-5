
import React, { useState, useEffect, useRef } from 'react';
import { ScoreState, ReplayState, ChatMessage, CommerceProduct, SystemHealth, ProductionEvent, RundownItem, Suggestion, TeleprompterState, PodcastState, StreamerState, PodcastSeries, PodcastEpisode, DJState, DJDeck, MediaItem, StreamAlert, DroneState, HardwareSwitcherState, CopilotState } from '../types';
import { BroadcastButton } from './Modules'; 
import { generateEditorialPitch } from '../services/geminiService';
import { DEMO_COMMERCE_PRODUCTS, MEDIA_LIBRARY } from '../constants';
import { MessageSquare, ThumbsUp, Trash2, Youtube, Twitch, Facebook, Video, CheckCircle, Calendar, PlayCircle, SkipForward, AlertTriangle, Zap, Type, Scroll, Users, LayoutGrid, Disc, Box, Eye, Heart, MessageCircle, Tag, ShoppingBag, Clock, Percent, Package, Truck, Music, Play, ShieldOff, Shield, Film, Scissors, Bell, Mic, Settings, Sliders, List, Plus, Pause, RefreshCw, Volume2, Flag, RotateCcw, Target, Plane, Gamepad, Wifi, Battery, Server, Link, Anchor, Cpu, Bot, MicOff, MessageSquareText } from 'lucide-react';

// --- COPILOT PANEL (V10 UPGRADE) ---
export const AICopilotPanel: React.FC<{
    state: CopilotState;
    onToggleVoice: () => void;
    onExecute: (p: any) => void;
}> = ({ state, onToggleVoice, onExecute }) => {
    return (
        <div className="h-full bg-zinc-900 border border-zinc-800 rounded p-2 flex flex-col gap-2">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                <div className="flex items-center gap-2">
                    <Bot size={16} className="text-purple-400 animate-pulse" />
                    <span className="text-xs font-black text-white tracking-widest uppercase">Gemini Copilot</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${state.status === 'LISTENING' ? 'bg-red-500 animate-ping' : 'bg-zinc-700'}`}></div>
                    <span className="text-[8px] font-mono text-zinc-500">{state.status}</span>
                </div>
            </div>

            <div className="h-12 bg-black rounded border border-zinc-800 flex items-center justify-center gap-0.5 px-4">
                {state.status === 'LISTENING' ? (
                    [...Array(12)].map((_, i) => (
                        <div 
                            key={i} 
                            className="w-1 bg-purple-500 rounded-full animate-bounce" 
                            style={{ height: `${20 + Math.random() * 60}%`, animationDelay: `${i * 0.1}s` }}
                        ></div>
                    ))
                ) : (
                    <div className="w-full h-[1px] bg-zinc-800"></div>
                )}
            </div>

            <div className="bg-black/50 p-2 rounded border border-zinc-800 h-16 overflow-y-auto no-scrollbar">
                <span className="text-[10px] text-zinc-600 font-bold uppercase block mb-1">Live Transcript</span>
                <p className="text-xs text-zinc-300 italic">
                    {state.lastTranscript || "Say 'Cut to Cam 1' or 'Show Replay'..."}
                </p>
            </div>

            <div className="flex-1 flex flex-col min-h-0">
                <span className="text-[9px] text-zinc-500 font-bold uppercase mb-2">Director Assist</span>
                <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar">
                    {state.suggestions.map(s => (
                        <div key={s.id} className="bg-zinc-800 border-l-4 border-purple-500 p-2 rounded shadow-sm group">
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-[8px] bg-purple-900/50 text-purple-200 px-1 rounded font-bold">{s.type}</span>
                                <span className="text-[8px] text-zinc-500">{new Date(s.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                            </div>
                            <div className="text-[11px] font-bold text-white leading-tight mb-2">{s.message}</div>
                            <button 
                                onClick={() => onExecute(s.payload)}
                                className="w-full bg-zinc-700 hover:bg-purple-600 text-white text-[9px] font-black py-1.5 rounded transition-colors uppercase"
                            >
                                {s.actionLabel}
                            </button>
                        </div>
                    ))}
                    {state.suggestions.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-8 text-zinc-700">
                            <Zap size={24} className="opacity-20 mb-2"/>
                            <span className="text-[10px] font-bold">MONITORING PGM...</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-auto">
                <button 
                    onClick={onToggleVoice}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${state.status === 'LISTENING' ? 'bg-red-600 border-red-400 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)]' : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}
                >
                    {state.status === 'LISTENING' ? <Mic size={20} /> : <MicOff size={20} />}
                    <span className="text-[8px] font-black mt-1 uppercase">Voice Director</span>
                </button>
                <button className="flex flex-col items-center justify-center p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-400 hover:text-white">
                    <MessageSquareText size={20} />
                    <span className="text-[8px] font-black mt-1 uppercase">Chat Summary</span>
                </button>
            </div>
        </div>
    );
};

export const ReplayPanel: React.FC<{ state: ReplayState; onUpdate: (u: Partial<ReplayState>) => void; onStinger: () => void; onSetSpeed: (s: number) => void; onPlay: () => void; onStop: () => void; }> = () => (
    <div className="bg-zinc-900 p-2 rounded border border-zinc-800 h-full">Replay Panel</div>
);

export const CommercePanel: React.FC = () => (
    <div className="bg-zinc-900 p-2 rounded border border-zinc-800 h-full">Commerce Panel</div>
);

export const ChatPanel: React.FC = () => (
    <div className="bg-zinc-900 p-2 rounded border border-zinc-800 h-full">Chat Panel</div>
);

export const RundownPanel: React.FC = () => (
    <div className="bg-zinc-900 p-2 rounded border border-zinc-800 h-full">Rundown Panel</div>
);

export const AssistPanel: React.FC = () => (
    <div className="bg-zinc-900 p-2 rounded border border-zinc-800 h-full">Assist Panel</div>
);

export const TeleprompterPanel: React.FC = () => (
    <div className="bg-zinc-900 p-2 rounded border border-zinc-800 h-full">Teleprompter Panel</div>
);

export const PodcastPanel: React.FC<any> = () => (
    <div className="bg-zinc-900 p-2 rounded border border-zinc-800 h-full">Podcast Panel</div>
);

export const StreamerPanel: React.FC<any> = () => (
    <div className="bg-zinc-900 p-2 rounded border border-zinc-800 h-full">Streamer Panel</div>
);

export const DJPanel: React.FC<any> = () => (
    <div className="bg-zinc-900 p-2 rounded border border-zinc-800 h-full">DJ Panel</div>
);

export const EngagementHub: React.FC<any> = () => (
    <div className="bg-zinc-900 p-2 rounded border border-zinc-800 h-full">Engagement Hub</div>
);

export const DronePanel: React.FC<{ state: DroneState; onUpdateGimbal: (p: number, y: number) => void; onToggleMode: () => void; }> = ({ state, onUpdateGimbal, onToggleMode }) => {
    return (
        <div className="h-full bg-zinc-900 border border-zinc-800 rounded p-2 flex flex-col">
            <div className="flex justify-between items-center mb-2 border-b border-zinc-800 pb-2">
                <div className="flex items-center gap-2">
                    <Plane size={14} className={state.connected ? "text-blue-500" : "text-red-500"} />
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-white uppercase">{state.model}</span>
                        <span className={`text-[8px] font-mono ${state.connected ? 'text-green-500' : 'text-red-500'}`}>{state.connected ? 'CONNECTED' : 'DISCONNECTED'}</span>
                    </div>
                </div>
                <div className="flex gap-2 text-[9px] font-mono text-zinc-400">
                    <span className="flex items-center gap-1"><Battery size={10}/> {state.battery}%</span>
                    <span className="flex items-center gap-1"><Wifi size={10}/> {state.signalStrength}%</span>
                </div>
            </div>
            <div className="flex-1 bg-black rounded border border-zinc-800 relative overflow-hidden mb-2">
                <div className="absolute w-full h-[1px] bg-green-500/50 left-0 top-1/2 transition-transform" style={{ transform: `rotate(${state.stickInput.rightX * 10}deg) translateY(${state.gimbalPitch * 2}px)` }}></div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><Target size={48} className="text-white/20" /></div>
                <div className="absolute bottom-2 left-2 w-16 h-16 border border-zinc-700 rounded-full bg-zinc-900/50 flex items-center justify-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" style={{ transform: `translate(${state.stickInput.leftX * 25}px, ${state.stickInput.leftY * 25}px)` }}></div>
                </div>
                <div className="absolute bottom-2 right-2 w-16 h-16 border border-zinc-700 rounded-full bg-zinc-900/50 flex items-center justify-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" style={{ transform: `translate(${state.stickInput.rightX * 25}px, ${state.stickInput.rightY * 25}px)` }}></div>
                </div>
                {state.failsafeActive && <div className="absolute inset-0 bg-red-900/50 flex items-center justify-center animate-pulse"><span className="text-white font-black text-xl bg-red-600 px-4 py-2 rounded">RTH ACTIVE</span></div>}
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div className="grid grid-cols-2 gap-1 text-[9px] font-mono text-zinc-400 bg-zinc-950 p-2 rounded border border-zinc-800">
                    <span>ALT: <span className="text-white">{state.altitude.toFixed(1)}m</span></span>
                    <span>SPD: <span className="text-white">{state.speed.toFixed(1)}m/s</span></span>
                    <span>PITCH: <span className="text-white">{state.gimbalPitch.toFixed(0)}°</span></span>
                    <span>REC: <span className={state.recording ? "text-red-500 animate-pulse" : "text-zinc-600"}>●</span></span>
                </div>
                <div className="flex flex-col gap-1">
                    <button onClick={onToggleMode} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-2 rounded text-[10px] font-bold border border-zinc-700">MODE: <span className="text-blue-400">{state.mode}</span></button>
                    <button className="bg-red-900/30 hover:bg-red-900 text-red-200 py-2 rounded text-[10px] font-bold border border-red-800">EMERGENCY HOVER</button>
                </div>
            </div>
        </div>
    );
};

export const HardwareStatusPanel: React.FC<{ state: HardwareSwitcherState; onCut: () => void }> = ({ state, onCut }) => {
    return (
        <div className="bg-black border border-zinc-800 rounded p-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Server size={14} className={state.connected ? "text-green-500" : "text-zinc-600"} />
                <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase">{state.model}</span>
                    <span className={`text-[8px] font-bold ${state.syncStatus === 'SYNCED' ? 'text-green-600' : 'text-amber-600'}`}>{state.syncStatus}</span>
                </div>
            </div>
            {state.connected && (
                <div className="flex items-center gap-2">
                    <div className="text-[8px] text-zinc-500 text-right">
                        <div>LAST ACTION</div>
                        <div className="text-zinc-300">{state.lastExternalAction || 'None'}</div>
                    </div>
                    <div className="h-8 w-2 bg-zinc-800 rounded-full relative">
                        <div className="absolute left-0 right-0 h-2 bg-white rounded-full shadow transition-all duration-75" style={{ top: `${100 - state.faderPosition}%` }}></div>
                    </div>
                    <button onClick={onCut} className="bg-zinc-800 hover:bg-zinc-700 text-[9px] px-2 py-1 rounded border border-zinc-700">TEST</button>
                </div>
            )}
        </div>
    );
};

export const HealthPanel: React.FC<{ health: SystemHealth }> = ({ health }) => {
    return (
       <div className="h-full bg-zinc-900 border border-zinc-800 rounded p-2 flex flex-col gap-1">
          <div className="text-[10px] font-bold text-zinc-500 uppercase flex justify-between">
              <span>System Health</span>
              <span className={health.thermalStatus > 1 ? "text-red-500 animate-pulse" : "text-green-500"}>{health.thermalStatus === 0 ? "NOMINAL" : "WARM"}</span>
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] font-mono text-zinc-400">
             <div className="flex justify-between"><span>CPU</span> <span className={health.cpuLoad > 80 ? "text-red-500" : "text-green-400"}>{health.cpuLoad}%</span></div>
             <div className="flex justify-between"><span>BAT</span> <span className={health.isCharging ? "text-blue-400" : "text-white"}>{health.batteryLevel}%</span></div>
             <div className="flex justify-between"><span>FPS</span> <span className="text-white">{health.fps}</span></div>
             <div className="flex justify-between"><span>MEM</span> <span className="text-zinc-500">{health.usedMemoryMB}M</span></div>
          </div>
       </div>
    );
 };
