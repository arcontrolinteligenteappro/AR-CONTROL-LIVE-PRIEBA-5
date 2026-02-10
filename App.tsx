
import React, { useState, useEffect } from 'react';
import SetupWizard from './components/SetupWizard';
import { 
    useSwitcherEngine, useScoreboardEngine, useAudioEngine, useSourceEngine, useTelemetryEngine, 
    useRCPEngine, useChatEngine, useCommerceEngine, useAutomationEngine,
    useStreamerEngine, usePodcastEngine, useGraphicsEngine, useCopilotEngine, useSceneEngine, useHardwareSwitcherEngine
} from './services/BroadcastEngines';
import { MobileControlLayout, StudioControlLayout } from './components/Layouts';
import { OverlayRenderer } from './components/Overlays';
import { AppFace, TransmissionMode, VideoSource, AudioChannel, RTMPConfig } from './types';
import { Play, Square, ShieldAlert, Sun, Moon, LayoutTemplate } from 'lucide-react';

interface AppConfig {
    sources: VideoSource[];
    audio: AudioChannel[];
    rtmp: RTMPConfig[];
}

const MainApp: React.FC<{ initialConfig: AppConfig }> = ({ initialConfig }) => {
  // --- INITIALIZE ENGINES ---
  // Pass initial configuration to source and audio engines
  const sourceEngine = useSourceEngine(initialConfig.sources);
  const sceneEngine = useSceneEngine();
  const hwEngine = useHardwareSwitcherEngine(); // Hardware Sync
  const switcher = useSwitcherEngine(sourceEngine.sources, sceneEngine, hwEngine);
  const scoreboard = useScoreboardEngine();
  const audio = useAudioEngine(initialConfig.audio);
  const telemetry = useTelemetryEngine();
  const rcpEngine = useRCPEngine();
  const chatEngine = useChatEngine();
  const commerceEngine = useCommerceEngine();
  const automationEngine = useAutomationEngine(switcher, audio);
  
  // New V10 Engines
  const streamerEngine = useStreamerEngine(switcher, audio);
  const podcastEngine = usePodcastEngine();
  const graphicsEngine = useGraphicsEngine();
  const copilotEngine = useCopilotEngine(switcher, audio, commerceEngine, scoreboard); 

  // --- UI STATE ---
  const [face, setFace] = useState<AppFace>(AppFace.STUDIO_PRO);
  const [mode, setMode] = useState<TransmissionMode>(TransmissionMode.GENERAL);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // --- THEME HANDLER ---
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // --- OVERLAY COMPOSITOR (Now using GraphicsEngine + Switcher Triggers) ---
  const overlayLayers = [
    { id: 'sb', type: 'SCOREBOARD' as const, visible: switcher.state.keyer.dsk1Active, zIndex: 10, data: null },
    { id: 'chat', type: 'CHAT_LOWER' as const, visible: switcher.state.keyer.dsk2Active, zIndex: 20, data: null },
    { id: 'comm', type: 'COMMERCE' as const, visible: !!commerceEngine.state.activeProductId, zIndex: 15, data: commerceEngine.state.inventory.find(p => p.id === commerceEngine.state.activeProductId) },
    // GraphicsEngine managed layers (Ticker, Logo, Sponsors)
    ...graphicsEngine.state.overlays.filter(o => o.type === 'TICKER' || o.type === 'LOGO')
  ];

  return (
    <div className={`h-screen w-screen bg-zinc-950 dark:bg-zinc-950 text-white overflow-hidden font-sans select-none flex flex-col ${streamerEngine.state.safeMode ? 'grayscale brightness-50' : ''}`}>
      
      {/* 1. BROADCAST SAFE LAYER (Global Overlays) */}
      <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
        {switcher.state.pgmId === 'safe_source' && (
             <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-red-600 text-white font-bold px-4 py-2 animate-pulse shadow-2xl z-[100] border-2 border-white">
                ⚠️ FAILSAFE ACTIVE - SOURCE LOST
             </div>
        )}
        {streamerEngine.state.safeMode && (
             <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-[100]">
                <div className="text-center">
                    <ShieldAlert size={64} className="text-red-500 mx-auto mb-4 animate-bounce" />
                    <h1 className="text-4xl font-bold text-white">SAFE MODE ACTIVE</h1>
                    <p className="text-zinc-400">Audio Muted • Video Cut to Safe</p>
                    <button onClick={streamerEngine.toggleSafeMode} className="mt-4 bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded font-bold pointer-events-auto">DEACTIVATE</button>
                </div>
             </div>
        )}
        <OverlayRenderer 
            layers={overlayLayers} 
            scoreData={scoreboard.data} 
            chatMessage={chatEngine.messages.find(m => m.status === 'ON_AIR')}
        />
      </div>

      {/* 2. HEADER (Critical Controls) */}
      <div className="h-10 bg-black border-b border-zinc-800 flex items-center justify-between px-2 z-40 relative shrink-0">
         <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-sm ${switcher.state.isLive ? 'bg-red-600 animate-pulse' : 'bg-zinc-700'}`}></div>
            <span className="font-bold tracking-widest text-sm">ARCLS <span className="text-zinc-500 text-[10px] align-top">V10</span></span>
         </div>

         {/* MODE SELECTOR */}
         <div className="flex items-center bg-zinc-900 rounded border border-zinc-800 p-0.5">
            <LayoutTemplate size={12} className="ml-2 text-zinc-500" />
            <select 
                value={mode} 
                onChange={(e) => setMode(e.target.value as TransmissionMode)}
                className="bg-transparent text-[10px] font-bold text-white uppercase outline-none px-2 py-0.5 cursor-pointer"
            >
                <option value={TransmissionMode.GENERAL}>General</option>
                <option value={TransmissionMode.SPORTS}>Sports Live</option>
                <option value={TransmissionMode.DRONE_OPS}>Drone Ops</option>
                <option value={TransmissionMode.PODCAST}>Podcast/Interview</option>
                <option value={TransmissionMode.COMMERCE}>Live Commerce</option>
                <option value={TransmissionMode.GAMER}>Gamer/Streamer</option>
                <option value={TransmissionMode.DJ}>DJ Performance</option>
            </select>
         </div>
         
         <div className="flex gap-2 items-center">
             {/* THEME TOGGLE */}
             <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400">
                {theme === 'dark' ? <Moon size={12}/> : <Sun size={12}/>}
             </button>

             <div className="w-[1px] bg-zinc-700 mx-1 h-4"></div>

             <button onClick={streamerEngine.toggleSafeMode} className={`flex items-center gap-1 text-[10px] font-bold px-3 py-1 rounded border ${streamerEngine.state.safeMode ? 'bg-red-600 border-red-500 text-white' : 'bg-zinc-900 border-zinc-700 text-zinc-500 hover:text-red-500'}`}>
                <ShieldAlert size={10} /> SAFE
             </button>
             
             <button onClick={switcher.toggleLive} className={`flex items-center gap-1 text-[10px] font-bold px-3 py-1 rounded transition-colors ${switcher.state.isLive ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                {switcher.state.isLive ? <Square size={10} fill="currentColor"/> : <Play size={10} fill="currentColor"/>}
                {switcher.state.isLive ? 'ON AIR' : 'GO LIVE'}
             </button>
             
             <div className="w-[1px] bg-zinc-700 mx-1 h-4"></div>
             
             <div className="flex bg-zinc-900 rounded p-0.5 border border-zinc-800">
                 <button onClick={() => setFace(AppFace.STUDIO_PRO)} className={`text-[9px] font-bold px-2 py-0.5 rounded ${face===AppFace.STUDIO_PRO ? 'bg-blue-900 text-white' : 'text-zinc-500'}`}>STUDIO</button>
                 <button onClick={() => setFace(AppFace.SINGLE_EASY)} className={`text-[9px] font-bold px-2 py-0.5 rounded ${face===AppFace.SINGLE_EASY ? 'bg-blue-900 text-white' : 'text-zinc-500'}`}>SINGLE</button>
             </div>
         </div>
      </div>

      {/* 3. WORKSPACE (Dynamic Layout) */}
      <div className="flex-1 min-h-0 relative">
          {face === AppFace.STUDIO_PRO ? (
             <StudioControlLayout 
                switcher={switcher} scoreboard={scoreboard} audio={audio} sourceEngine={sourceEngine} 
                commerce={commerceEngine} automation={automationEngine} chat={chatEngine} telemetry={telemetry}
                mode={mode} // Pass mode to Studio Layout
             />
          ) : (
             <MobileControlLayout 
                switcher={switcher} scoreboard={scoreboard} audio={audio} sourceEngine={sourceEngine} 
                commerce={commerceEngine} automation={automationEngine} chat={chatEngine} mode={mode}
             />
          )}
      </div>
    </div>
  );
}


function App() {
    const [config, setConfig] = useState<AppConfig | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const savedSources = localStorage.getItem('arcls_sources');
            const savedAudio = localStorage.getItem('arcls_audio');
            const savedRtmp = localStorage.getItem('arcls_rtmp');
            
            if (savedSources && savedAudio && savedRtmp) {
                // If configuration exists, parse and set it
                setConfig({
                    sources: JSON.parse(savedSources),
                    audio: JSON.parse(savedAudio),
                    rtmp: JSON.parse(savedRtmp)
                });
            }
        } catch (e) {
            console.error("Failed to load configuration from localStorage", e);
            // Clear corrupted data in case of parsing error
            localStorage.removeItem('arcls_sources');
            localStorage.removeItem('arcls_audio');
            localStorage.removeItem('arcls_rtmp');
        } finally {
            setLoading(false); // Done loading, either found config or determined none exists
        }
    }, []);

    const handleSetupComplete = (sources: VideoSource[], audio: AudioChannel[], rtmp: RTMPConfig[]) => {
        // The wizard already saved to localStorage, we just need to update the state
        setConfig({ sources, audio, rtmp });
    };

    if (loading) {
        return (
            <div className="h-screen w-screen bg-broadcast-bg flex items-center justify-center">
                <p className="text-broadcast-muted animate-pulse">Initializing Studio...</p>
            </div>
        );
    }
    
    // If no configuration is found after loading, show the SetupWizard
    if (!config) {
        return <SetupWizard onComplete={handleSetupComplete} />;
    }

    // Otherwise, render the MainApp with the loaded configuration
    return <MainApp initialConfig={config} />;
}

export default App;
