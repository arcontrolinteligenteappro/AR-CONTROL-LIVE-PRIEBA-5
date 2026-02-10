
import React, { useState, useEffect } from 'react';
import { AudioDeviceService } from '../services/audioDeviceService';
import { AudioEngineStatus } from '../types';
import { Activity, Mic, Speaker, Settings, Shield, Cpu, RefreshCw, X } from 'lucide-react';

export const AudioDeviceModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const engine = AudioDeviceService.getInstance();
    const [status, setStatus] = useState<AudioEngineStatus>(engine.getStatus());
    const [inputs, setInputs] = useState<MediaDeviceInfo[]>(engine.getInputs());
    const [outputs, setOutputs] = useState<MediaDeviceInfo[]>(engine.getOutputs());

    useEffect(() => {
        const unsub = engine.subscribe(setStatus);
        setInputs(engine.getInputs());
        setOutputs(engine.getOutputs());
        return unsub;
    }, []);

    const handleInputSelect = async (id: string) => {
        try {
            await engine.setInputDevice(id, true); // Force Pro Mode by default
        } catch (e) {
            alert("Failed to open device. Check permissions.");
        }
    };

    return (
        <div className="absolute inset-0 bg-zinc-950/95 z-[100] flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col">
                
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-zinc-800 bg-zinc-950">
                    <div className="flex items-center gap-2">
                        <Activity size={20} className="text-green-500"/>
                        <div>
                            <h2 className="text-white font-bold text-lg">Audio Device Manager</h2>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">UAPP BIT-PERFECT MODE</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white"><X size={20}/></button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    
                    {/* Status Dashboard */}
                    <div className="grid grid-cols-4 gap-2">
                        <div className="bg-black border border-zinc-800 p-2 rounded flex flex-col items-center">
                            <span className="text-[9px] text-zinc-500 uppercase font-bold">Sample Rate</span>
                            <span className="text-xl font-mono text-blue-400">{status.sampleRate / 1000}k</span>
                        </div>
                        <div className="bg-black border border-zinc-800 p-2 rounded flex flex-col items-center">
                            <span className="text-[9px] text-zinc-500 uppercase font-bold">Buffer</span>
                            <span className="text-xl font-mono text-zinc-300">~{status.bufferSize}</span>
                        </div>
                        <div className="bg-black border border-zinc-800 p-2 rounded flex flex-col items-center">
                            <span className="text-[9px] text-zinc-500 uppercase font-bold">Driver</span>
                            <span className="text-xl font-mono text-amber-500">WASAPI</span>
                        </div>
                        <div className="bg-black border border-zinc-800 p-2 rounded flex flex-col items-center">
                            <span className="text-[9px] text-zinc-500 uppercase font-bold">Pro Mode</span>
                            <span className={`text-xl font-bold ${status.proModeActive ? 'text-green-500' : 'text-zinc-600'}`}>{status.proModeActive ? 'ON' : 'OFF'}</span>
                        </div>
                    </div>

                    {/* Input Selection */}
                    <div>
                        <h3 className="text-xs font-bold text-zinc-400 uppercase mb-2 flex items-center gap-2"><Mic size={14}/> Input Devices (USB/Internal)</h3>
                        <div className="space-y-1">
                            {inputs.map(dev => (
                                <div key={dev.deviceId} onClick={() => handleInputSelect(dev.deviceId)} className={`flex items-center justify-between p-3 rounded border cursor-pointer hover:bg-zinc-800 transition-colors ${status.activeInput === dev.deviceId ? 'bg-zinc-800 border-green-500' : 'bg-black border-zinc-800'}`}>
                                    <div className="flex flex-col">
                                        <span className="text-sm text-white font-bold">{dev.label || `Unknown Device ${dev.deviceId.slice(0,4)}`}</span>
                                        <span className="text-[10px] text-zinc-500">{dev.kind} • {dev.deviceId.slice(0,8)}...</span>
                                    </div>
                                    {status.activeInput === dev.deviceId && <span className="text-[10px] bg-green-900 text-green-200 px-2 py-1 rounded font-bold">ACTIVE</span>}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Config & Constraints */}
                    <div>
                        <h3 className="text-xs font-bold text-zinc-400 uppercase mb-2 flex items-center gap-2"><Settings size={14}/> Engine Configuration</h3>
                        <div className="bg-black border border-zinc-800 rounded p-4 space-y-4">
                            
                            {/* Sample Rate */}
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="text-sm font-bold text-white">Sample Rate Lock</div>
                                    <div className="text-[10px] text-zinc-500">Forces engine sample rate. Warning: Causes audio restart.</div>
                                </div>
                                <select 
                                    value={status.sampleRate} 
                                    onChange={(e) => engine.setSampleRate(Number(e.target.value) as any)}
                                    className="bg-zinc-900 border border-zinc-700 text-white text-xs px-2 py-1 rounded"
                                >
                                    <option value={44100}>44.1 kHz</option>
                                    <option value={48000}>48.0 kHz (Broadcast)</option>
                                    <option value={96000}>96.0 kHz (Hi-Res)</option>
                                </select>
                            </div>

                            {/* Pro Mode Toggle */}
                            <div className="flex justify-between items-center border-t border-zinc-800 pt-3">
                                <div>
                                    <div className="text-sm font-bold text-white flex items-center gap-2"><Shield size={14} className="text-purple-500"/> Direct USB / Pro Mode</div>
                                    <div className="text-[10px] text-zinc-500">Bypasses Android AGC, Noise Suppression & Echo Cancel.</div>
                                </div>
                                <button className={`w-10 h-5 rounded-full relative transition-colors ${status.proModeActive ? 'bg-green-600' : 'bg-zinc-700'}`}>
                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${status.proModeActive ? 'right-1' : 'left-1'}`}></div>
                                </button>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
