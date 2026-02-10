
// --- SPORTS ENGINE (V8.3 UNIVERSAL REGISTRY) ---
export type SportType = 
  | 'football' | 'soccer' | 'basketball' | 'volleyball' | 'baseball' | 'softball'
  | 'hockey' | 'boxing' | 'mma' | 'tennis' | 'pingpong' | 'badminton'
  | 'racing' | 'cycling' | 'swimming' | 'athletics' | 'wrestling'
  | 'esports' | 'cricket' | 'rugby' | 'generic' | 'futsal' | 'taekwondo' | 'motorsports';

export interface SportAction {
  id: string;
  label: string;
  type: 'score' | 'period' | 'foul' | 'timeout' | 'stat' | 'reset' | 'set' | 'extra' | 'base' | 'clock' | 'possession' | 'down' | 'distance' | 'ball' | 'strike' | 'out' | 'card' | 'shot_clock_reset' | 'service_toggle' | 'kd_hit';
  target?: 'home' | 'guest' | 'game';
  value: any; 
  color?: 'zinc' | 'blue' | 'red' | 'amber' | 'green' | 'purple';
  group?: 'main' | 'stats' | 'flow' | 'bases' | 'penalties' | 'shot_clock';
}

export interface SportProfile {
  id: string;
  name: string;
  type: SportType;
  template: 'type_a' | 'type_b' | 'type_c' | 'type_d' | 'type_e'; // A:Goals, B:Points, C:Line, D:Combat, E:Racing
  actions: SportAction[];
  layoutStyle?: 'compact_box' | 'lower_bar' | 'minimal' | 'baseball_card' | 'combat_card' | 'leaderboard';
  clockType?: 'count_up' | 'count_down';
  defaultDuration?: number;
  periods?: number;
  periodLabel?: string; // "1st Half", "Q1", "Inning", "Round"
  hasShotClock?: boolean;
  shotClockDuration?: number;
  hasSets?: boolean;
  restDuration?: number; // For boxing
}

export interface ScoreState {
  sportId: string;
  homeName: string;
  guestName: string;
  homeScore: number;
  guestScore: number;
  period: number; 
  timer: string;
  timerRunning: boolean;
  clockSeconds: number;
  possession?: 'home' | 'guest' | 'none';
  timeouts?: { home: number, guest: number };
  fouls?: { home: number, guest: number };
  down?: number;
  distance?: string;
  yardLine?: number;
  balls?: number;
  strikes?: number;
  outs?: number;
  bases?: [boolean, boolean, boolean]; 
  inningTop?: boolean;
  errors?: { home: number, guest: number };
  hits?: { home: number, guest: number };
  sets?: { home: number, guest: number }; 
  cards?: { homeRed: number, homeYellow: number, guestRed: number, guestYellow: number };
  roundTimer?: number;
  extras: Record<string, any>;
  lastAction?: { type: string; timestamp: number; details: string; value?: any }; 
  shotClockSeconds: number;
  isRestPeriod: boolean;
  serviceSide?: 'home' | 'guest';
  kdCount?: { home: number, guest: number };
}

// --- VIDEO & SOURCES ---

export enum SourceType {
  SLATE = 'SLATE',
  CAMERA = 'CAMERA',
  RTSP = 'RTSP',
  NDI = 'NDI',
  SCREEN = 'SCREEN',
  MEDIA = 'MEDIA',
  WEBRTC = 'WEBRTC',
  IP_STREAM = 'IP_STREAM',
  DRONE = 'DRONE'
}

export interface VideoSource {
  id: string;
  label: string;
  displayName: string;
  originTag?: string;
  type: SourceType;
  active: boolean;
  status: 'OK' | 'NO_SIGNAL' | 'CONNECTING' | 'VALIDATING' | 'ERROR' | 'FAILSAFE';
  previewUrl?: string;
  nativeUrl?: string;
  stream?: MediaStream;
  deviceId?: string;
  capabilities?: SourceCapabilities;
}

export interface SourceCapabilities {
    width: number;
    height: number;
    frameRate: number;
    aspectRatio: number;
    ptz: boolean;
    audio: boolean;
    facingMode?: 'user' | 'environment';
    drone?: boolean;
}

// --- COPILOT AI ENGINE ---

export interface Suggestion {
    id: string;
    type: 'TACTICAL' | 'OPERATIONAL' | 'COMMERCE' | 'VOICE_CMD';
    priority: 'HIGH' | 'LOW';
    message: string;
    actionLabel: string;
    timestamp: number;
    context?: string;
    payload?: any;
}

export interface CopilotState {
    suggestions: Suggestion[];
    status: 'IDLE' | 'ANALYZING' | 'LISTENING' | 'EXECUTING';
    autoDirector: boolean;
    lastTranscript: string;
    visionActive: boolean;
}

// --- SYSTEM ---

export interface SystemHealth {
    cpuLoad: number;
    gpuLoad: number;
    fps: number;
    droppedFrames: number;
    networkStatus: 'GOOD' | 'BAD' | 'OFFLINE';
    thermalStatus: number;
    batteryLevel: number;
    isCharging: boolean;
    usedMemoryMB: number;
}

export type ChatPlatform = 'YOUTUBE' | 'TWITCH' | 'FACEBOOK' | 'TIKTOK';

export interface ChatMessage {
    id: string;
    platform: ChatPlatform;
    user: string;
    text: string;
    timestamp: number;
    status: 'INBOX' | 'APPROVED' | 'ON_AIR' | 'ARCHIVED';
    avatar?: string;
    isModerator?: boolean;
}

export enum AppFace {
    STUDIO_PRO = 'STUDIO_PRO',
    SINGLE_EASY = 'SINGLE_EASY'
}

export enum TransmissionMode {
    GENERAL = 'GENERAL',
    SPORTS = 'SPORTS',
    PODCAST = 'PODCAST',
    COMMERCE = 'COMMERCE',
    GAMER = 'GAMER',
    DJ = 'DJ',
    DRONE_OPS = 'DRONE_OPS'
}

export interface OverlayLayer {
    id: string;
    type: 'SCOREBOARD' | 'LOWER_THIRD' | 'CHAT_LOWER' | 'TICKER' | 'LOGO' | 'COMMERCE' | 'SPONSOR' | 'WIDGET' | 'SOCIAL_PROOF' | 'ALERT';
    visible: boolean;
    zIndex: number;
    data: any;
}

export interface RundownItem {
  id: string;
  title: string;
  type: 'SEGMENT' | 'COMMERCIAL' | 'VO' | 'PKG';
  duration: number; // seconds
  notes: string;
  cues: string[];
  completed: boolean;
}

export interface ReplayState {
    recording: boolean;
    active: boolean;
    bufferUsage: number; // 0-100%
    clipId?: string;
    speed: number; // 0.25, 0.5, 1.0
    markTimestamp?: number;
}

export interface SwitcherState {
    pgmId: string; // Active Scene ID
    pvwId: string; // Preview Scene ID
    transitioning: boolean;
    transitionType: 'MIX' | 'WIPE' | 'CUT' | 'STINGER';
    transitionProgress: number; // 0-100
    isLive: boolean;
    isRecording: boolean;
    keyer: {
        dsk1Active: boolean;
        dsk2Active: boolean;
        chromaActive: boolean;
    };
    hardwareSync: HardwareSwitcherState;
}

export interface HardwareSwitcherState {
    connected: boolean;
    model: string; 
    syncStatus: 'SYNCED' | 'CONFLICT' | 'OFFLINE';
    tally: { pgm: number[]; pvw: number[] }; 
    faderPosition: number; 
    lastExternalAction: string;
}

export interface RCPState {
    iris: number;
    gain: number;
    shutter: number;
    whiteBalance: number;
    focus: number;
    blackLevel: number;
    cameraId?: string;
}

export interface DroneState {
    connected: boolean;
    model: string;
    battery: number;
    signalStrength: number;
    altitude: number;
    speed: number;
    gimbalPitch: number; 
    yaw: number;
    recording: boolean;
    mode: 'CINE' | 'NORMAL' | 'SPORT';
    stickInput: {
        leftX: number;
        leftY: number;
        rightX: number;
        rightY: number;
    };
    failsafeActive: boolean;
}

export interface GamepadState {
    id: string;
    connected: boolean;
    axes: number[];
    buttons: { pressed: boolean; value: number }[];
    timestamp: number;
}

export interface DJDeck {
    id: 'A' | 'B';
    track: MediaItem | null;
    playing: boolean;
    bpm: number;
    pitch: number; 
    position: number; 
    loop: boolean;
    cuePoints: number[];
}

export interface DJState {
    deckA: DJDeck;
    deckB: DJDeck;
    crossfader: number; 
    masterVolume: number;
    syncEnabled: boolean;
}

export interface MediaItem {
    id: string;
    title: string;
    type: 'VIDEO' | 'AUDIO' | 'IMAGE';
    duration: string;
    url: string;
    bpm?: number;
}

// --- AUDIO (V8.6) ---
export enum AudioRole {
  MASTER = 'MASTER',
  MIC = 'MIC',
  MUSIC = 'MUSIC',
  REMOTE = 'REMOTE'
}

export interface AudioDynamics {
    compressor: { threshold: number; ratio: number; attack: number; release: number; active: boolean };
    gate: { threshold: number; active: boolean };
    limiter: { threshold: number; active: boolean };
}

export interface EQ5Band {
    lowCut: number; low: number; lowMid: number; highMid: number; high: number;
}

export interface DSPConfig {
    delayMs: number; pan: number; inputGain: number;
}

export interface AudioRouting {
    toMaster: boolean; toMonitor: boolean; toStream: boolean; toAux: boolean;
}

export interface AudioChannel {
    id: string;
    label: string;
    level: number;
    gain: number;
    pan: number;
    muted: boolean;
    solo: boolean;
    afv: boolean;
    peak: number;
    role: AudioRole;
    eq: EQ5Band;
    dynamics: AudioDynamics;
    dsp: DSPConfig;
    routing: AudioRouting;
    duckingTarget?: boolean;
    deviceId?: string;
}

export interface AudioEngineStatus {
    running: boolean;
    sampleRate: number;
    bufferSize: number;
    activeInput: string;
    activeOutput: string;
    cpuLoad: number;
    proModeActive: boolean;
}

export interface AudioDeviceProfile {
    id: string;
    name: string;
}

// --- COMMERCE (V10) ---
export interface CommerceProduct {
    id: string;
    name: string;
    price: string;
    stock: number;
    description: string;
    variants?: string[];
    status: 'AVAILABLE' | 'LOW_STOCK' | 'SOLD_OUT';
    image?: string;
}

export interface CommerceState {
    inventory: CommerceProduct[];
    activeProductId: string | null;
    totalViewers: number;
    orders: number;
}

// --- MACROS & AUTOMATION ---
export interface MacroAction {
    type: 'SCENE_RECALL' | 'WAIT' | 'OVERLAY_TOGGLE' | 'AUDIO_MUTE' | 'AUDIO_UNMUTE' | 'SOURCE_PVW' | 'AUTO' | 'CUT';
    payload?: any;
}

export interface Macro {
    id: string;
    label: string;
    color: 'red' | 'green' | 'blue' | 'zinc' | 'amber' | 'purple';
    actions: MacroAction[];
}

export interface Pad {
    id: string;
    label: string;
    color: 'red' | 'green' | 'blue' | 'zinc' | 'amber' | 'purple';
    actionId?: string;
}

// --- SCENES & GRAPHICS ---
export interface BroadcastSceneItem {
    id: string;
    sourceId: string;
    transform: { x: number; y: number; scale: number; zIndex: number };
    visible: boolean;
    locked: boolean;
}

export interface BroadcastScene {
    id: string;
    name: string;
    type: 'MEDIA' | 'COMPOSITE' | 'PIP';
    items: BroadcastSceneItem[];
}

export interface ScenePreset {
    id: string;
    name: string;
}

export interface GraphicsState {
    overlays: OverlayLayer[];
}

// --- PTZ & HARDWARE ---
export enum PTZProtocol {
    VISCA_IP = 'VISCA_IP',
    ONVIF = 'ONVIF',
    SIMULATOR = 'SIMULATOR'
}

export interface PTZConfig {
    ip: string;
    port: number;
    protocol: PTZProtocol;
    username?: string;
    password?: string;
}

export interface PTZPreset {
    id: string;
    label: string;
}

export interface MidiDevice {
    id: string;
    name: string;
    state: string;
}

// --- PODCAST & STREAMING ---
export interface PodcastChapter {
    id: string;
    title: string;
    timestamp: number;
}

export interface PodcastEpisode {
    id: string;
    number: number;
    title: string;
    guests: string[];
    duration: string;
    status: 'PUBLISHED' | 'PLANNED';
    recordingDate?: number;
}

export interface PodcastSeries {
    id: string;
    title: string;
    host: string;
    season: number;
    coverImage: string;
    episodes: PodcastEpisode[];
}

export interface PodcastState {
    activeSeriesId: string | null;
    activeEpisodeId: string | null;
    recording: boolean;
    layout: string;
}

export interface StreamAlert {
    id: string;
    type: 'FOLLOWER' | 'SUBSCRIBER' | 'DONATION' | 'RAID';
    user: string;
    message?: string;
}

export interface StreamerState {
    safeMode: boolean;
    alerts: StreamAlert[];
    scenes: string[];
}

export interface SocialProof {
    id: string;
    platform: ChatPlatform;
    count: number;
    type: 'LIKE' | 'SHARE' | 'VIEWER';
}

// --- MISC ---
export interface RTMPConfig {
    url: string;
    key: string;
    enabled: boolean;
    status: 'IDLE' | 'STREAMING' | 'ERROR';
}

export interface ProductionEvent {
    id: string;
    timestamp: number;
    type: string;
    message: string;
}

export interface TeleprompterState {
    text: string;
    speed: number;
    running: boolean;
}

export interface LogEntry {
    id: string;
    timestamp: number;
    level: 'INFO' | 'WARN' | 'ERROR';
    message: string;
}

export interface Sponsor {
    id: string;
    name: string;
    logo: string;
    active: boolean;
}

export interface Widget {
    id: string;
    type: 'CLOCK' | 'WEATHER';
    visible: boolean;
    data: any;
}
