
import { useState, useCallback, useEffect, useRef } from 'react';
import { 
    VideoSource, SwitcherState, AudioChannel, ScoreState, SportProfile, SportAction, SystemHealth, RCPState, AudioRole,
    ChatMessage, ChatPlatform, ProductionEvent, RundownItem, Suggestion, TeleprompterState,
    CommerceState, CommerceProduct, Macro, MacroAction,
    GraphicsState, PodcastState, StreamerState, OverlayLayer, CopilotState, PodcastChapter, SocialProof, StreamAlert, PodcastSeries, PodcastEpisode,
    DJState, MediaItem, BroadcastScene, ReplayState, DroneState, HardwareSwitcherState, SourceType
} from '../types';
import { SAFE_SOURCE, MOCK_SOURCES, INITIAL_AUDIO, SPORTS_PROFILES, DEMO_COMMERCE_PRODUCTS, DEFAULT_RUNDOWN, DEFAULT_SPONSORS, DEFAULT_WIDGETS, DEFAULT_PODCAST_SERIES, DEFAULT_SCENES, MEDIA_LIBRARY } from '../constants';
import { analyzeTactics, parseVoiceIntent, detectCommerceKeywords } from './geminiService';

// --- COPILOT AI ENGINE (V10: DIRECTOR ASSIST) ---
export const useCopilotEngine = (switcher: any, audio: any, commerce: any, scoreboard: any) => {
    const [state, setState] = useState<CopilotState>({
        suggestions: [],
        status: 'IDLE',
        autoDirector: false,
        lastTranscript: '',
        visionActive: true
    });

    const recognitionRef = useRef<any>(null);

    // 1. TACTICAL VISION LOOP
    useEffect(() => {
        if (!state.visionActive) return;
        
        const visionInterval = setInterval(async () => {
            const suggestion = await analyzeTactics("MOCK_IMAGE_DATA", scoreboard.data.sportId);
            if (suggestion) {
                const newSugg: Suggestion = {
                    id: Date.now().toString(),
                    type: 'TACTICAL',
                    priority: 'HIGH',
                    message: suggestion,
                    actionLabel: 'SWITCH CAM',
                    timestamp: Date.now()
                };
                setState(prev => ({ ...prev, suggestions: [newSugg, ...prev.suggestions].slice(0, 5) }));
            }
        }, 12000); // Analysis every 12s

        return () => clearInterval(visionInterval);
    }, [state.visionActive, scoreboard.data.sportId]);

    // 2. VOICE DIRECTOR SETUP
    useEffect(() => {
        // @ts-ignore
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onresult = async (event: any) => {
                const transcript = event.results[event.results.length - 1][0].transcript;
                setState(prev => ({ ...prev, lastTranscript: transcript, status: 'LISTENING' }));

                if (event.results[event.results.length - 1].isFinal) {
                    const intent = await parseVoiceIntent(transcript);
                    if (intent?.action) {
                        executeCommand(intent);
                    }
                }
            };
            recognitionRef.current = recognition;
        }
    }, []);

    const executeCommand = (intent: any) => {
        setState(prev => ({ ...prev, status: 'EXECUTING' }));
        console.log("[COPILOT] Executing Voice Intent:", intent);
        
        switch(intent.action) {
            case 'CUT': 
                if (intent.payload) switcher.setPgm(intent.payload);
                else switcher.cut();
                break;
            case 'PVW': switcher.setPvw(intent.payload); break;
            case 'REPLAY': 
                // Placeholder for replay logic
                // replayEngine.playReplay(intent.payload); 
                break;
            case 'COMMERCE_PUSH':
                commerce.setActiveProduct(intent.payload);
                break;
        }

        setTimeout(() => setState(prev => ({ ...prev, status: 'IDLE' })), 1000);
    };

    const toggleVoice = () => {
        if (state.status === 'LISTENING') {
            recognitionRef.current?.stop();
            setState(s => ({ ...s, status: 'IDLE' }));
        } else {
            recognitionRef.current?.start();
            setState(s => ({ ...s, status: 'LISTENING' }));
        }
    };

    const dismissSuggestion = (id: string) => {
        setState(prev => ({ ...prev, suggestions: prev.suggestions.filter(s => s.id !== id) }));
    };

    return { state, toggleVoice, dismissSuggestion, executeCommand };
};

export const useSourceEngine = (initialSources?: VideoSource[]) => {
    // Initialize sources with provided config or default mocks
    const [sources, setSources] = useState<VideoSource[]>(initialSources || [SAFE_SOURCE, ...MOCK_SOURCES]);
    const updateSourceMetadata = (id: string, updates: Partial<VideoSource>) => {
        setSources(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    };
    const addSource = (source: VideoSource) => setSources(prev => [...prev, source]);
    const removeSource = (id: string) => setSources(prev => prev.filter(s => s.id !== id));
    return { sources, updateSourceMetadata, addSource, removeSource, setSources };
};

export const useSceneEngine = () => {
    const [scenes, setScenes] = useState<BroadcastScene[]>(DEFAULT_SCENES);
    const [activeSceneId, setActiveSceneId] = useState<string>('scene_start');
    const [previewSceneId, setPreviewSceneId] = useState<string>('scene_talk');
    return { scenes, activeSceneId, previewSceneId, setActiveSceneId, setPreviewSceneId };
};

export const useHardwareSwitcherEngine = () => {
    const [hwState, setHwState] = useState<HardwareSwitcherState>({
        connected: false, model: 'ATEM Mini Pro ISO', syncStatus: 'OFFLINE', tally: { pgm: [], pvw: [] }, faderPosition: 0, lastExternalAction: ''
    });
    const simulateExternalCut = useCallback(() => {
        setHwState(s => ({ ...s, lastExternalAction: `CUT @ ${Date.now()}`, faderPosition: s.faderPosition === 0 ? 100 : 0 }));
    }, []);
    return { hwState, simulateExternalCut };
};

export const useSwitcherEngine = (sources: VideoSource[], sceneEngine: any, hwEngine: any) => {
    const [state, setState] = useState<SwitcherState>({
        pgmId: sceneEngine.activeSceneId, pvwId: sceneEngine.previewSceneId, transitioning: false, transitionType: 'MIX', transitionProgress: 0, isLive: false, isRecording: false, keyer: { dsk1Active: false, dsk2Active: false, chromaActive: false }, hardwareSync: hwEngine.hwState
    });
    const cut = () => {
        setState(s => {
            sceneEngine.setActiveSceneId(s.pvwId);
            sceneEngine.setPreviewSceneId(s.pgmId);
            return { ...s, pgmId: s.pvwId, pvwId: s.pgmId };
        });
    };
    const setPvw = (id: string) => { setState(s => ({ ...s, pvwId: id })); sceneEngine.setPreviewSceneId(id); };
    const setPgm = (id: string) => { setState(s => ({ ...s, pgmId: id })); sceneEngine.setActiveSceneId(id); };
    const toggleLive = () => setState(s => ({ ...s, isLive: !s.isLive }));
    return { state, cut, setPvw, setPgm, toggleLive };
};

export const useScoreboardEngine = () => {
    const [data, setData] = useState<ScoreState>({
        sportId: 'soccer', homeName: 'HOME', guestName: 'GUEST', homeScore: 0, guestScore: 0, period: 1, timer: '00:00', timerRunning: false, clockSeconds: 0, extras: {}, shotClockSeconds: 0, isRestPeriod: false, kdCount: { home: 0, guest: 0 }
    });
    return { data, profile: SPORTS_PROFILES.soccer, loadSport: () => {}, processAction: () => {}, setData };
};

export const useAudioEngine = (initialAudio?: AudioChannel[]) => {
    // Initialize audio channels with provided config or default
    const [channels, setChannels] = useState<AudioChannel[]>(initialAudio || INITIAL_AUDIO);
    const updateChannel = (id: string, updates: Partial<AudioChannel>) => setChannels(prev => prev.map(ch => ch.id === id ? { ...ch, ...updates } : ch));
    return { channels, updateChannel };
};

export const useChatEngine = () => ({ messages: [], approveMessage: () => {}, toggleOnAir: () => {}, deleteMessage: () => {} });
export const useGraphicsEngine = () => ({ state: { overlays: [] }, toggleOverlay: () => {}, updateOverlayData: () => {} });
export const useCommerceEngine = () => ({ state: { inventory: DEMO_COMMERCE_PRODUCTS, activeProductId: null, totalViewers: 0, orders: 0 }, setActiveProduct: () => {}, setStatus: () => {} });

// --- FIXED SIGNATURE ---
export const useAutomationEngine = (switcher: any, audio: any) => ({ executeMacro: () => {} });

export const useTelemetryEngine = () => ({ cpuLoad: 0, batteryLevel: 100, fps: 60 });
export const useRCPEngine = () => ({ current: {}, setActiveCamId: () => {}, updateParam: () => {} });

// FIX: Replaced mock useReplayEngine with a stateful implementation to fix type error and enable functionality.
export const useReplayEngine = () => {
    const [state, setState] = useState<ReplayState>({
        recording: false,
        active: false,
        bufferUsage: 0,
        speed: 1.0,
    });

    const playReplay = () => setState(s => ({ ...s, active: true }));
    const stopReplay = () => setState(s => ({ ...s, active: false }));
    const setSpeed = (speed: number) => setState(s => ({ ...s, speed }));

    return { state, playReplay, stopReplay, setSpeed, setState };
};

export const useDroneEngine = () => {
    const [state, setState] = useState<DroneState>({
        connected: false,
        model: 'Mavic 3 Pro',
        battery: 85,
        signalStrength: 90,
        altitude: 45,
        speed: 12,
        gimbalPitch: -45,
        yaw: 0,
        recording: false,
        mode: 'NORMAL',
        stickInput: { leftX: 0, leftY: 0, rightX: 0, rightY: 0 },
        failsafeActive: false
    });
    return { state, updateGimbal: () => {}, toggleMode: () => {}, setState };
};

// --- NEW V10 ENGINES ---
export const useStreamerEngine = (switcher: any, audio: any) => ({
    state: { safeMode: false, alerts: [], scenes: [] },
    setScene: () => {},
    toggleSafeMode: () => {},
    toggleSafeOption: () => {},
    triggerAlert: () => {},
    markClip: () => {}
});

export const usePodcastEngine = () => ({
    state: { activeSeriesId: null, activeEpisodeId: null, recording: false, layout: 'talk' },
    seriesList: DEFAULT_PODCAST_SERIES,
    activeSeries: DEFAULT_PODCAST_SERIES[0],
    activeEpisode: null,
    setLayout: () => {},
    toggleIso: () => {},
    setRecordingMode: () => {},
    setAudioPreset: () => {},
    setActiveSeries: () => {},
    setActiveEpisode: () => {},
    createEpisode: () => {}
});

export const useTeleprompterEngine = () => ({
    state: { text: '', speed: 50, running: false },
    toggle: () => {},
    setText: () => {},
    setSpeed: () => {}
});

export const useDJEngine = () => ({
    state: { deckA: { playing: false }, deckB: { playing: false }, crossfader: 0 },
    togglePlay: () => {},
    setCrossfader: () => {},
    setPitch: () => {},
    loadTrack: () => {}
});

export const useInputControlEngine = (drone: any, switcher: any) => {
    useEffect(() => {
        // Polling logic
    }, []);
};

export const useRundownEngine = () => ({
    rundown: DEFAULT_RUNDOWN,
    completeItem: () => {},
    addItem: () => {}
});
