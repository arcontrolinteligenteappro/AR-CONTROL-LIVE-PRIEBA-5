
import React, { useState, useEffect } from 'react';
import VideoSourceDisplay from './VideoSource';
import AudioMixer from './AudioMixer';
import { BroadcastButton, ScoreboardController, RCPControl } from './Modules';
import { SourceManager } from './SourceManager';
import { HealthPanel, ReplayPanel, CommercePanel, AICopilotPanel, ChatPanel, RundownPanel, AssistPanel, TeleprompterPanel, PodcastPanel, StreamerPanel, DJPanel, EngagementHub, DronePanel, HardwareStatusPanel } from './BroadcastPanels';
import { useChatEngine, useCopilotEngine, useTeleprompterEngine, usePodcastEngine, useStreamerEngine, useDJEngine, useSceneEngine, useReplayEngine, useDroneEngine, useHardwareSwitcherEngine, useInputControlEngine, useRundownEngine } from '../services/BroadcastEngines';
import { Settings, Gamepad2, Repeat, MessageSquare, List, Zap, Radio, MonitorPlay, Volume2, Shield, Home, Settings2, BarChart2, GripVertical, Bot } from 'lucide-react';
import { TransmissionMode, AppFace } from '../types';

// --- STUDIO LAYOUT (PRO 3-COLUMN) ---
export const StudioControlLayout: React.FC<any> = ({ switcher, scoreboard, audio, sourceEngine, commerce, automation, chat, telemetry, mode = TransmissionMode.GENERAL }) => {
    const [showSourceManager, setShowSourceManager] = useState(false);
    
    // New Engines V8.8
    const hwEngine = useHardwareSwitcherEngine();
    const droneEngine = useDroneEngine();
    
    // AI Copilot Integration
    const copilotEngine = useCopilotEngine(switcher, audio, commerce, scoreboard);

    // Input Control hook-in
    useInputControlEngine(droneEngine, switcher);

    // Existing
    const chatEngine = useChatEngine();
    const rundownEngine = useRundownEngine();
    const prompterEngine = useTeleprompterEngine();
    const podcastEngine = usePodcastEngine();
    const streamerEngine = useStreamerEngine(switcher, audio);
    const djEngine = useDJEngine();
    const replayEngine = useReplayEngine();

    // Mapped Sources
    const pgmSource = sourceEngine.sources.find((s:any) => s.id === switcher.state.pgmId) || { id: switcher.state.pgmId, type: 'SCENE', displayName: 'SCENE', active: true };
    const pvwSource = sourceEngine.sources.find((s:any) => s.id === switcher.state.pvwId) || { id: switcher.state.pvwId, type: 'SCENE', displayName: 'SCENE', active: true };
    
    // FAILSAFE INJECTION
    if (droneEngine.state.failsafeActive) {
        if (pgmSource.type === 'DRONE') pgmSource.status = 'FAILSAFE';
        if (pvwSource.type === 'DRONE') pvwSource.status = 'FAILSAFE';
    }

    const formattedTime = `${Math.floor(scoreboard.data.clockSeconds / 60).toString().padStart(2, '0')}:${(scoreboard.data.clockSeconds % 60).toString().padStart(2, '0')}`;
    
    // COL 3: DYNAMIC MODULE
    const renderModulePanel = () => {
        switch(mode) {
            case TransmissionMode.DJ:
                return <DJPanel state={djEngine.state} onPlay={djEngine.togglePlay} onCrossfade={djEngine.setCrossfader} onPitch={djEngine.setPitch} onLoadTrack={djEngine.loadTrack} />;
            case TransmissionMode.PODCAST:
                return <PodcastPanel state={podcastEngine.state} seriesList={podcastEngine.seriesList} activeSeries={podcastEngine.activeSeries} activeEpisode={podcastEngine.activeEpisode} onLayout={podcastEngine.setLayout} onSoundboard={() => {}} onIso={podcastEngine.toggleIso} setRecordingMode={podcastEngine.setRecordingMode} setAudioPreset={podcastEngine.setAudioPreset} onSelectSeries={podcastEngine.setActiveSeries} onSelectEpisode={podcastEngine.setActiveEpisode} onCreateEpisode={podcastEngine.createEpisode} />;
            case TransmissionMode.GAMER:
                return (
                    <div className="flex flex-col h-full gap-2">
                        <StreamerPanel state={streamerEngine.state} onScene={streamerEngine.setScene} toggleSafeMode={streamerEngine.toggleSafeMode} toggleSafeOption={streamerEngine.toggleSafeOption} triggerAlert={streamerEngine.triggerAlert} markClip={streamerEngine.markClip} />
                        <div className="h-1/3"><EngagementHub chat={chatEngine.messages} alerts={streamerEngine.state.alerts} onApprove={chatEngine.approveMessage} onToggleOnAir={chatEngine.toggleOnAir} /></div>
                    </div>
                );
            case TransmissionMode.COMMERCE:
                return <CommercePanel />;
            case TransmissionMode.DRONE_OPS:
                return <DronePanel state={droneEngine.state} onUpdateGimbal={droneEngine.updateGimbal} onToggleMode={droneEngine.toggleMode} />;
            case TransmissionMode.SPORTS:
                return (
                    <div className="flex flex-col gap-2 h-full">
                        <div className="flex-1"><ScoreboardController data={scoreboard.data} profile={scoreboard.profile} onAction={scoreboard.processAction} onUpdateRaw={scoreboard.setData} onLoadSport={scoreboard.loadSport} formattedTime={formattedTime} /></div>
                        <div className="h-1/3"><ReplayPanel state={replayEngine.state} onUpdate={(updates) => replayEngine.setState((prev: any) => ({ ...prev, ...updates }))} onStinger={() => {}} onSetSpeed={replayEngine.setSpeed} onPlay={replayEngine.playReplay} onStop={replayEngine.stopReplay} /></div>
                    </div>
                );
            default: // General
                return (
                    <div className="flex flex-col h-full gap-2">
                        <AICopilotPanel state={copilotEngine.state} onToggleVoice={copilotEngine.toggleVoice} onExecute={copilotEngine.executeCommand} />
                        <div className="h-1/3"><EngagementHub chat={chatEngine.messages} alerts={[]} onApprove={chatEngine.approveMessage} onToggleOnAir={chatEngine.toggleOnAir} /></div>
                    </div>
                );
        }
    };

    return (
        <div className="flex h-full bg-zinc-950 text-white overflow-hidden relative">
             {showSourceManager && <SourceManager sources={sourceEngine.sources} onUpdate={sourceEngine.updateSourceMetadata} onAdd={sourceEngine.addSource} onRemove={sourceEngine.removeSource} onClose={() => setShowSourceManager(false)} />}
            
            {/* COL 1: RESOURCES / INPUTS (20%) */}
            <div className="w-[20%] border-r border-zinc-800 bg-zinc-900 flex flex-col">
                <div className="h-10 border-b border-zinc-800 flex items-center px-2 justify-between bg-black">
                    <span className="text-xs font-bold text-zinc-400">INPUTS</span>
                    <button onClick={() => setShowSourceManager(true)} className="text-[10px] bg-zinc-800 px-2 py-1 rounded hover:text-white flex items-center gap-1"><Settings size={10}/> SETUP</button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {sourceEngine.sources.filter((s:any) => s.id !== 'safe_source').map((s:any) => (
                        <div key={s.id} onClick={() => switcher.setPvw(s.id)} className={`relative aspect-video bg-black rounded border-2 cursor-pointer group ${switcher.state.pvwId === s.id ? 'border-green-500' : switcher.state.pgmId === s.id ? 'border-red-600' : 'border-zinc-800 hover:border-zinc-600'}`}>
                            <VideoSourceDisplay source={s} compact showLabel={false} />
                            <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-2 py-1 flex justify-between items-center">
                                <span className="text-[10px] font-bold truncate">{s.displayName}</span>
                                {switcher.state.pgmId === s.id && <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="border-t border-zinc-800 bg-zinc-950 p-1 flex flex-col gap-1">
                    <HardwareStatusPanel state={hwEngine.hwState} onCut={hwEngine.simulateExternalCut} />
                    <div className="h-32"><AudioMixer channels={audio.channels.filter((c:any) => c.role === 'MASTER' || c.role === 'MIC')} onUpdateChannel={audio.updateChannel} /></div>
                </div>
            </div>

            {/* COL 2: MASTER CONTROL (50%) */}
            <div className="w-[50%] flex flex-col bg-zinc-950">
                <div className="flex-1 p-4 flex gap-4 items-center justify-center bg-black/50">
                    <div className="flex-1 aspect-video bg-black border-4 border-green-800 rounded-lg relative overflow-hidden shadow-2xl">
                        <VideoSourceDisplay source={pvwSource} isPvw />
                        <span className="absolute top-2 left-2 bg-green-700 text-white font-bold px-2 py-0.5 text-xs rounded">PREVIEW</span>
                    </div>
                    <div className="flex-1 aspect-video bg-black border-4 border-red-800 rounded-lg relative overflow-hidden shadow-2xl">
                        <VideoSourceDisplay source={pgmSource} isPgm />
                        <span className="absolute top-2 left-2 bg-red-700 text-white font-bold px-2 py-0.5 text-xs rounded">PROGRAM</span>
                    </div>
                </div>
                <div className="h-32 bg-zinc-900 border-t border-zinc-800 p-4 flex items-center gap-8 justify-center">
                    <div className="flex flex-col gap-2">
                        <BroadcastButton label="CUT" onClick={switcher.cut} className="w-32 h-12 text-xl bg-zinc-800 border-b-4 border-zinc-950" />
                        <BroadcastButton label="AUTO" onClick={() => {}} color="red" className="w-32 h-12 text-xl border-b-4 border-red-900" />
                    </div>
                    <div className="w-64 h-16 bg-black rounded-lg border border-zinc-700 relative flex items-center px-4">
                        <div className="absolute left-4 right-4 h-2 bg-zinc-800 rounded-full"></div>
                        <div className="w-12 h-14 bg-zinc-600 rounded shadow-xl absolute top-1 cursor-grab active:cursor-grabbing border-t border-zinc-500 flex items-center justify-center transition-all duration-75" style={{ left: `${hwEngine.hwState.connected ? hwEngine.hwState.faderPosition : switcher.state.transitionProgress}%` }}>
                            <GripVertical className="text-zinc-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* COL 3: DYNAMIC MODULES (30%) */}
            <div className="w-[30%] border-l border-zinc-800 bg-zinc-900 flex flex-col p-2">
                <div className="h-8 mb-2 flex items-center justify-between border-b border-zinc-800 pb-1">
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">{mode} CONSOLE</span>
                    <Bot size={14} className={copilotEngine.state.status === 'LISTENING' ? "text-red-500 animate-pulse" : "text-zinc-600"}/>
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto">
                    {renderModulePanel()}
                </div>
            </div>
        </div>
    );
};

export const MobileControlLayout: React.FC<any> = () => (
    <div className="h-full bg-zinc-950 flex items-center justify-center">Mobile Layout Placeholder</div>
);
