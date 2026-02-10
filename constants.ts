
import { VideoSource, SourceType, AudioChannel, SportProfile, CommerceProduct, Macro, AudioRole, AudioDynamics, EQ5Band, DSPConfig, RundownItem, PTZPreset, Pad, MediaItem, Sponsor, Widget, PodcastSeries, BroadcastScene } from './types';

// --- BROADCAST SAFE DEFAULTS ---
export const SAFE_SOURCE: VideoSource = {
  id: 'safe_source',
  label: 'SAFE',
  displayName: 'SAFE SLATE',
  originTag: 'SYSTEM',
  type: SourceType.SLATE,
  active: true,
  status: 'OK',
  previewUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxOTIwIDEwODAiPjxyZWN0IHdpZHRoPSIxOTIwIiBoZWlnaHQ9IjEwODAiIGZpbGw9IiMxMTEiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzk5OSIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSI1MCI+U0FGRSBTT1VSQ0U8L3RleHQ+PC9zdmc+'
};

export const MOCK_SOURCES: VideoSource[] = [
  { id: 'cam1', label: 'CAM 1', displayName: 'Host Main', originTag: 'Studio', type: SourceType.CAMERA, previewUrl: 'https://picsum.photos/600/338?random=1', active: true, status: 'OK' },
  { id: 'cam2', label: 'CAM 2', displayName: 'Wide Shot', originTag: 'Studio', type: SourceType.CAMERA, previewUrl: 'https://picsum.photos/600/338?random=2', active: true, status: 'OK' },
  { id: 'cam3', label: 'CAM 3', displayName: 'Guest Remote', originTag: 'Remote', type: SourceType.CAMERA, previewUrl: 'https://picsum.photos/600/338?random=3', active: true, status: 'OK' },
  { id: 'media1', label: 'MEDIA', displayName: 'Intro Loop', originTag: 'Disk', type: SourceType.MEDIA, previewUrl: 'https://picsum.photos/600/338?random=4', active: true, status: 'OK' },
];

// --- AUDIO DEFAULTS ---
const DEFAULT_DYNAMICS: AudioDynamics = {
    compressor: { threshold: -20, ratio: 4, attack: 10, release: 100, active: false },
    gate: { threshold: -45, active: false },
    limiter: { threshold: -1, active: true }
};

const DEFAULT_EQ: EQ5Band = {
    lowCut: 80, low: 0, lowMid: 0, highMid: 0, high: 0
};

const DEFAULT_DSP: DSPConfig = {
    delayMs: 0, pan: 0, inputGain: 0
};

const DEFAULT_ROUTING = {
    toMaster: true, toMonitor: true, toStream: true, toAux: false
};

export const INITIAL_AUDIO: AudioChannel[] = [
  { id: 'master', label: 'MASTER', level: 80, gain: 0, pan: 0, muted: false, solo: false, afv: false, peak: 0, role: AudioRole.MASTER, eq: DEFAULT_EQ, dynamics: DEFAULT_DYNAMICS, dsp: DEFAULT_DSP, routing: DEFAULT_ROUTING },
  { id: 'cam1', label: 'HOST', level: 75, gain: 0, pan: 0, muted: false, solo: false, afv: true, peak: 0, role: AudioRole.MIC, eq: DEFAULT_EQ, dynamics: DEFAULT_DYNAMICS, dsp: DEFAULT_DSP, routing: DEFAULT_ROUTING },
  { id: 'cam2', label: 'GUEST', level: 75, gain: 0, pan: 0, muted: false, solo: false, afv: false, peak: 0, role: AudioRole.MIC, eq: DEFAULT_EQ, dynamics: DEFAULT_DYNAMICS, dsp: DEFAULT_DSP, routing: DEFAULT_ROUTING },
  { id: 'dj_main', label: 'DJ DECK', level: 85, gain: 0, pan: 0, muted: false, solo: false, afv: false, peak: 0, role: AudioRole.MUSIC, eq: DEFAULT_EQ, dynamics: DEFAULT_DYNAMICS, dsp: DEFAULT_DSP, routing: DEFAULT_ROUTING, duckingTarget: true },
];

// --- SCENE DEFAULTS (OBS STYLE) ---
export const DEFAULT_SCENES: BroadcastScene[] = [
    { 
        id: 'scene_start', name: 'Starting Soon', type: 'MEDIA',
        items: [{ id: 'i1', sourceId: 'media1', transform: { x:0, y:0, scale:1, zIndex:0 }, visible: true, locked: true }]
    },
    { 
        id: 'scene_talk', name: 'Just Chatting', type: 'COMPOSITE',
        items: [
            { id: 'i2', sourceId: 'cam1', transform: { x:0, y:0, scale:1, zIndex:0 }, visible: true, locked: true },
            { id: 'i3', sourceId: 'cam3', transform: { x:0.7, y:0.7, scale:0.25, zIndex:1 }, visible: true, locked: false } // PiP
        ]
    },
    { 
        id: 'scene_game', name: 'Gameplay', type: 'PIP',
        items: [
            { id: 'i4', sourceId: 'media1', transform: { x:0, y:0, scale:1, zIndex:0 }, visible: true, locked: true }, // Game capture placeholder
            { id: 'i5', sourceId: 'cam1', transform: { x:0.02, y:0.75, scale:0.2, zIndex:1 }, visible: true, locked: false }
        ]
    }
];

// --- PODCAST DEFAULTS ---
export const DEFAULT_PODCAST_SERIES: PodcastSeries[] = [
    {
        id: 's1', title: 'Tech Talk Daily', host: 'Alex Dev', season: 1, 
        coverImage: 'https://via.placeholder.com/300/3b82f6/ffffff?text=Tech+Talk',
        episodes: [
            { id: 'e101', number: 101, title: 'The Future of AI', guests: ['Sarah Connor'], duration: '45:00', status: 'PUBLISHED', recordingDate: Date.now() - 10000000 },
            { id: 'e102', number: 102, title: 'WebRTC in 2025', guests: ['John Doe'], duration: '00:00', status: 'PLANNED' }
        ]
    },
    {
        id: 's2', title: 'Late Night Code', host: 'Sarah C', season: 3, 
        coverImage: 'https://via.placeholder.com/300/8b5cf6/ffffff?text=Late+Night',
        episodes: []
    }
];

// --- COMMERCE DEFAULTS ---
export const DEMO_COMMERCE_PRODUCTS: CommerceProduct[] = [
    { id: 'p1', name: 'Pro Jersey 2025', price: '$89.99', stock: 150, description: 'Official Team Jersey, Authentic Fit.', variants: ['S', 'M', 'L', 'XL'], status: 'AVAILABLE', image: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=Jersey' },
    { id: 'p2', name: 'Snapback Cap', price: '$29.99', stock: 12, description: 'Adjustable size, team logo.', variants: ['Black', 'Red'], status: 'LOW_STOCK', image: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=Cap' },
    { id: 'p3', name: 'Signed Ball', price: '$199.99', stock: 0, description: 'Limited Edition signed by captain.', status: 'SOLD_OUT', image: 'https://via.placeholder.com/150/FFFF00/000000?text=Ball' },
    { id: 'p4', name: 'Season Pass', price: '$299.00', stock: 1000, description: 'All access pass for next season.', status: 'AVAILABLE', image: 'https://via.placeholder.com/150/008000/FFFFFF?text=Pass' }
];

// --- MACROS ---
export const DEFAULT_MACROS: Macro[] = [
    { 
        id: 'intro_seq', label: 'INTRO SEQ', color: 'blue', 
        actions: [
            { type: 'SCENE_RECALL', payload: 'scene_start' },
            { type: 'WAIT', payload: 5000 },
            { type: 'SCENE_RECALL', payload: 'scene_talk' },
            { type: 'OVERLAY_TOGGLE', payload: 'lower_third' }
        ] 
    },
    { 
        id: 'break', label: 'GO TO BREAK', color: 'amber', 
        actions: [
            { type: 'AUDIO_MUTE', payload: 'cam1' },
            { type: 'AUDIO_MUTE', payload: 'cam2' },
            { type: 'SCENE_RECALL', payload: 'scene_start' }
        ] 
    },
    { 
        id: 'replay_hit', label: 'REPLAY HIT', color: 'red', 
        actions: [
            { type: 'SOURCE_PVW', payload: 'cam3' },
            { type: 'AUTO' }, // Stinger In
            { type: 'WAIT', payload: 4000 },
            { type: 'SOURCE_PVW', payload: 'cam1' },
            { type: 'AUTO' } // Stinger Out
        ] 
    },
    { id: 'mic_check', label: 'MIC CHECK', color: 'zinc', actions: [{ type: 'AUDIO_UNMUTE', payload: 'cam1' }] }
];

// --- SPORTS ---
export const SPORTS_PROFILES: Record<string, SportProfile> = {
  soccer: {
    id: 'soccer', name: 'Soccer (11v11)', type: 'soccer', template: 'type_a', layoutStyle: 'compact_box', clockType: 'count_up', defaultDuration: 2700, periods: 2, periodLabel: 'Half',
    actions: [
      { id: 'g_h', label: 'GOAL HOME', type: 'score', target: 'home', value: 1, color: 'blue', group: 'main' },
      { id: 'g_a', label: 'GOAL AWAY', type: 'score', target: 'guest', value: 1, color: 'red', group: 'main' },
      { id: 'y_h', label: 'YEL HOME', type: 'card', target: 'home', value: 'yellow', color: 'amber', group: 'penalties' },
      { id: 'y_a', label: 'YEL AWAY', type: 'card', target: 'guest', value: 'yellow', color: 'amber', group: 'penalties' },
      { id: 'r_h', label: 'RED HOME', type: 'card', target: 'home', value: 'red', color: 'red', group: 'penalties' },
      { id: 'r_a', label: 'RED AWAY', type: 'card', target: 'guest', value: 'red', color: 'red', group: 'penalties' },
      { id: 'sub', label: 'SUBSTITUTION', type: 'stat', value: 'sub', color: 'zinc', group: 'flow' },
      { id: 'var', label: 'VAR CHECK', type: 'stat', value: 'var', color: 'purple', group: 'flow' },
      { id: 'corner', label: 'CORNER', type: 'stat', value: 'corner', color: 'zinc', group: 'stats' },
      { id: 'shot', label: 'SHOT', type: 'stat', value: 'shot', color: 'zinc', group: 'stats' }
    ]
  },
  basketball: {
      id: 'basketball', name: 'Basketball', type: 'basketball', template: 'type_b', layoutStyle: 'lower_bar', clockType: 'count_down', defaultDuration: 720, periods: 4, periodLabel: 'Q',
      hasShotClock: true, shotClockDuration: 24,
      actions: [
          { id: 'p1h', label: '+1 HOME', type: 'score', target: 'home', value: 1, color: 'blue', group: 'main' },
          { id: 'p2h', label: '+2 HOME', type: 'score', target: 'home', value: 2, color: 'blue', group: 'main' },
          { id: 'p3h', label: '+3 HOME', type: 'score', target: 'home', value: 3, color: 'blue', group: 'main' },
          { id: 'p1g', label: '+1 GUEST', type: 'score', target: 'guest', value: 1, color: 'red', group: 'main' },
          { id: 'p2g', label: '+2 GUEST', type: 'score', target: 'guest', value: 2, color: 'red', group: 'main' },
          { id: 'p3g', label: '+3 GUEST', type: 'score', target: 'guest', value: 3, color: 'red', group: 'main' },
          { id: 'sc24', label: 'RESET 24', type: 'shot_clock_reset', value: 24, color: 'amber', group: 'shot_clock' },
          { id: 'sc14', label: 'RESET 14', type: 'shot_clock_reset', value: 14, color: 'amber', group: 'shot_clock' },
          { id: 'fl_h', label: 'FOUL HOME', type: 'foul', target: 'home', value: 1, color: 'amber', group: 'penalties' },
          { id: 'fl_a', label: 'FOUL AWAY', type: 'foul', target: 'guest', value: 1, color: 'amber', group: 'penalties' },
          { id: 'to_h', label: 'TIMEOUT H', type: 'timeout', target: 'home', value: 1, color: 'zinc', group: 'flow' },
          { id: 'to_a', label: 'TIMEOUT A', type: 'timeout', target: 'guest', value: 1, color: 'zinc', group: 'flow' },
          { id: 'poss', label: 'POSSESSION', type: 'possession', value: 0, color: 'purple', group: 'flow' },
      ]
  },
  volleyball: {
      id: 'volleyball', name: 'Volleyball', type: 'volleyball', template: 'type_b', layoutStyle: 'lower_bar', clockType: 'count_up', defaultDuration: 0, periods: 5, periodLabel: 'Set',
      hasSets: true,
      actions: [
          { id: 'pt_h', label: 'POINT HOME', type: 'score', target: 'home', value: 1, color: 'blue', group: 'main' },
          { id: 'pt_g', label: 'POINT GUEST', type: 'score', target: 'guest', value: 1, color: 'red', group: 'main' },
          { id: 'srv_h', label: 'SERVICE HOME', type: 'service_toggle', target: 'home', value: 'home', color: 'zinc', group: 'flow' },
          { id: 'srv_g', label: 'SERVICE GUEST', type: 'service_toggle', target: 'guest', value: 'guest', color: 'zinc', group: 'flow' },
          { id: 'sw_h', label: 'SET WON HOME', type: 'set', target: 'home', value: 1, color: 'blue', group: 'main' },
          { id: 'sw_g', label: 'SET WON GUEST', type: 'set', target: 'guest', value: 1, color: 'red', group: 'main' },
          { id: 'to_h', label: 'TIMEOUT H', type: 'timeout', target: 'home', value: 1, color: 'zinc', group: 'flow' },
          { id: 'to_a', label: 'TIMEOUT A', type: 'timeout', target: 'guest', value: 1, color: 'zinc', group: 'flow' },
      ]
  },
  boxing: {
      id: 'boxing', name: 'Boxing / MMA', type: 'boxing', template: 'type_d', layoutStyle: 'combat_card', clockType: 'count_down', defaultDuration: 180, periods: 12, periodLabel: 'Round',
      restDuration: 60,
      actions: [
          { id: 'kd_h', label: 'KD HOME', type: 'kd_hit', target: 'home', value: 1, color: 'blue', group: 'main' },
          { id: 'kd_g', label: 'KD GUEST', type: 'kd_hit', target: 'guest', value: 1, color: 'red', group: 'main' },
          { id: 'low_h', label: 'LOW BLOW H', type: 'foul', target: 'home', value: 1, color: 'amber', group: 'penalties' },
          { id: 'low_g', label: 'LOW BLOW G', type: 'foul', target: 'guest', value: 1, color: 'amber', group: 'penalties' },
          { id: 'tko', label: 'TKO/KO', type: 'stat', value: 'ko', color: 'red', group: 'flow' },
          { id: 'next_r', label: 'NEXT ROUND', type: 'period', value: 1, color: 'green', group: 'flow' },
      ]
  },
  nfl: {
      id: 'nfl', name: 'American Football', type: 'football', template: 'type_b', layoutStyle: 'lower_bar', clockType: 'count_down', defaultDuration: 900, periods: 4, periodLabel: 'Q',
      actions: [
          { id: 'td_h', label: 'TD HOME (6)', type: 'score', target: 'home', value: 6, color: 'blue', group: 'main' },
          { id: 'fg_h', label: 'FG HOME (3)', type: 'score', target: 'home', value: 3, color: 'blue', group: 'main' },
          { id: 'pat1_h', label: 'PAT (1)', type: 'score', target: 'home', value: 1, color: 'zinc', group: 'main' },
          { id: 'pat2_h', label: '2PT CONV', type: 'score', target: 'home', value: 2, color: 'zinc', group: 'main' },
          { id: 'td_a', label: 'TD AWAY (6)', type: 'score', target: 'guest', value: 6, color: 'red', group: 'main' },
          { id: 'fg_a', label: 'FG AWAY (3)', type: 'score', target: 'guest', value: 3, color: 'red', group: 'main' },
          { id: 'pat1_a', label: 'PAT (1)', type: 'score', target: 'guest', value: 1, color: 'zinc', group: 'main' },
          { id: 'down', label: 'DOWN +', type: 'down', value: 1, color: 'amber', group: 'flow' },
          { id: 'dist', label: 'DISTANCE', type: 'distance', value: 0, color: 'amber', group: 'flow' },
          { id: 'poss', label: 'POSSESSION', type: 'possession', value: 0, color: 'purple', group: 'flow' },
          { id: 'to_h', label: 'TIMEOUT H', type: 'timeout', target: 'home', value: 1, color: 'zinc', group: 'flow' },
          { id: 'to_a', label: 'TIMEOUT A', type: 'timeout', target: 'guest', value: 1, color: 'zinc', group: 'flow' },
      ]
  },
  baseball: {
      id: 'baseball', name: 'Baseball / Softball', type: 'baseball', template: 'type_c', layoutStyle: 'baseball_card', clockType: 'count_up', defaultDuration: 0, periods: 9, periodLabel: 'Inn',
      actions: [
          { id: 'ball', label: 'BALL', type: 'ball', value: 1, color: 'green', group: 'main' },
          { id: 'strike', label: 'STRIKE', type: 'strike', value: 1, color: 'amber', group: 'main' },
          { id: 'out', label: 'OUT', type: 'out', value: 1, color: 'red', group: 'main' },
          { id: 'hit', label: 'HIT', type: 'stat', value: 'hit', color: 'blue', group: 'stats' },
          { id: 'err', label: 'ERROR', type: 'stat', value: 'error', color: 'zinc', group: 'stats' },
          { id: 'run_h', label: 'RUN HOME', type: 'score', target: 'home', value: 1, color: 'blue', group: 'flow' },
          { id: 'run_a', label: 'RUN AWAY', type: 'score', target: 'guest', value: 1, color: 'red', group: 'flow' },
          { id: 'base1', label: '1B', type: 'base', value: 0, color: 'zinc', group: 'bases' },
          { id: 'base2', label: '2B', type: 'base', value: 1, color: 'zinc', group: 'bases' },
          { id: 'base3', label: '3B', type: 'base', value: 2, color: 'zinc', group: 'bases' },
          { id: 'clr', label: 'RESET COUNT', type: 'reset', value: 'count', color: 'zinc', group: 'flow' },
      ]
  },
  motorsports: {
      id: 'motorsports', name: 'Motorsports', type: 'motorsports', template: 'type_e', layoutStyle: 'leaderboard', clockType: 'count_up', defaultDuration: 0, periods: 0, periodLabel: 'Lap',
      actions: [
          { id: 'flag_g', label: 'GREEN FLAG', type: 'stat', value: 'green', color: 'green', group: 'main' },
          { id: 'flag_y', label: 'YELLOW FLAG', type: 'stat', value: 'yellow', color: 'amber', group: 'main' },
          { id: 'flag_r', label: 'RED FLAG', type: 'stat', value: 'red', color: 'red', group: 'main' },
          { id: 'flag_c', label: 'CHECKERED', type: 'stat', value: 'checkered', color: 'zinc', group: 'main' },
          { id: 'lap', label: 'LAP +', type: 'period', value: 1, color: 'blue', group: 'flow' },
          { id: 'pit', label: 'PIT STOP', type: 'stat', value: 'pit', color: 'purple', group: 'stats' }
      ]
  }
};

export const DEFAULT_RUNDOWN: RundownItem[] = [
    { id: 'r1', title: 'Start Stream', type: 'SEGMENT', duration: 10, notes: '', cues: [], completed: false }
];

export const PTZ_PRESETS: PTZPreset[] = [
    { id: '1', label: 'Wide' },
    { id: '2', label: 'Host' },
    { id: '3', label: 'Guest' },
    { id: '4', label: 'Product' }
];

export const VIRTUAL_PADS: Pad[] = [
    { id: 'p1', label: 'INTRO', color: 'blue', actionId: 'intro_seq' },
    { id: 'p2', label: 'BREAK', color: 'amber', actionId: 'break' },
    { id: 'p3', label: 'REPLAY', color: 'red', actionId: 'replay_hit' },
    { id: 'p4', label: 'MIC CHK', color: 'zinc', actionId: 'mic_check' },
    { id: 'p5', label: 'STINGER', color: 'purple' },
    { id: 'p6', label: 'GFX IN', color: 'green' },
    { id: 'p7', label: 'GFX OUT', color: 'green' },
    { id: 'p8', label: 'BLACK', color: 'zinc' }
];

export const MEDIA_LIBRARY: MediaItem[] = [
    { id: 'm1', title: 'Intro Sequence 2025', type: 'VIDEO', duration: '00:10', url: '', bpm: 128 },
    { id: 'm2', title: 'Stinger Transition', type: 'VIDEO', duration: '00:02', url: '', bpm: 0 },
    { id: 'm3', title: 'Background Loop', type: 'VIDEO', duration: '01:00', url: '', bpm: 120 },
    { id: 'm4', title: 'Upbeat Track', type: 'AUDIO', duration: '03:45', url: '', bpm: 124 },
    { id: 'm5', title: 'Swoosh SFX', type: 'AUDIO', duration: '00:01', url: '' },
    { id: 'm6', title: 'House Beat', type: 'AUDIO', duration: '04:20', url: '', bpm: 128 },
    { id: 'm7', title: 'Techno Loop', type: 'AUDIO', duration: '00:30', url: '', bpm: 135 }
];

// --- GRAPHICS DEFAULTS ---
export const DEFAULT_SPONSORS: Sponsor[] = [
    { id: 'sp1', name: 'TechCorp', logo: 'https://via.placeholder.com/150?text=TechCorp', active: true },
    { id: 'sp2', name: 'EnergyDrink', logo: 'https://via.placeholder.com/150?text=Energy', active: false },
    { id: 'sp3', name: 'BetSafe', logo: 'https://via.placeholder.com/150?text=Bet', active: false }
];

export const DEFAULT_WIDGETS: Widget[] = [
    { id: 'w_clock', type: 'CLOCK', visible: false, data: { format: 'HH:mm:ss' } },
    { id: 'w_weather', type: 'WEATHER', visible: false, data: { city: 'New York', temp: '72°F' } }
];
