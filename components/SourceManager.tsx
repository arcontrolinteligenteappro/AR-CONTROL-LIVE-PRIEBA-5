
import React, { useState } from 'react';
import { VideoSource, SourceType } from '../types';
import { scanVideoDevices, getScreenCaptureStream } from '../services/deviceService';
import { Settings, X, Save, Video, Globe, Link, Monitor, Plus, RefreshCw, Trash2, ArrowLeft } from 'lucide-react';

interface SourceManagerProps {
    sources: VideoSource[];
    onUpdate: (id: string, data: Partial<VideoSource>) => void;
    onAdd?: (source: VideoSource) => void;
    onRemove?: (id: string) => void;
    onClose: () => void;
}

type ViewState = 'LIST' | 'SELECT_TYPE' | 'ADD_MANUAL' | 'DISCOVERING';

export const SourceManager: React.FC<SourceManagerProps> = ({ sources, onUpdate, onAdd, onRemove, onClose }) => {
    const [view, setView] = useState<ViewState>('LIST');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editData, setEditData] = useState<{name: string, tag: string}>({ name: '', tag: '' });
    
    // Add Source State
    const [newSourceType, setNewSourceType] = useState<SourceType>(SourceType.RTSP);
    const [newSourceUrl, setNewSourceUrl] = useState('');
    const [newSourceLabel, setNewSourceLabel] = useState('');

    // --- ACTIONS ---

    const handleEdit = (source: VideoSource) => {
        setEditingId(source.id);
        setEditData({ name: source.displayName, tag: source.originTag || '' });
    };

    const handleSaveEdit = (id: string) => {
        onUpdate(id, { displayName: editData.name, originTag: editData.tag });
        setEditingId(null);
    };

    const handleDiscover = async () => {
        if (!onAdd) return;
        setView('DISCOVERING');
        try {
            const devices = await scanVideoDevices();
            // Filter out existing
            const newDevices = devices.filter(d => !sources.find(s => s.deviceId === d.deviceId));
            
            if (newDevices.length === 0) {
                alert("No new devices found.");
            } else {
                newDevices.forEach(d => onAdd(d));
            }
        } catch (e) {
            console.error(e);
        }
        setView('LIST');
    };

    const handleAddScreen = async () => {
        if (!onAdd) return;
        const s: VideoSource = {
            id: `scr_${Date.now()}`,
            label: "Screen Share",
            displayName: "Screen Share",
            type: SourceType.SCREEN,
            active: true,
            status: 'OK'
        };
        onAdd(s);
        setView('LIST');
    };

    const handleAddManual = () => {
        if (!onAdd) return;
        const s: VideoSource = {
            id: `${newSourceType.toLowerCase()}_${Date.now()}`,
            label: newSourceLabel || "New Source",
            displayName: newSourceLabel || "New Source",
            type: newSourceType,
            active: true,
            status: 'CONNECTING',
            nativeUrl: newSourceUrl
        };
        onAdd(s);
        setView('LIST');
    };

    const getIcon = (type: SourceType) => {
        switch(type) {
            case SourceType.CAMERA: return <Video size={18} className="text-blue-500"/>;
            case SourceType.RTSP: return <Globe size={18} className="text-purple-500"/>;
            case SourceType.NDI: return <Link size={18} className="text-amber-500"/>;
            case SourceType.SCREEN: return <Monitor size={18} className="text-green-500"/>;
            default: return <div className="w-3 h-3 bg-zinc-600 rounded-full"/>;
        }
    };

    return (
        <div className="absolute inset-0 bg-black/95 z-[100] flex items-end md:items-center justify-center p-0 md:p-8 backdrop-blur-md">
            <div className="bg-zinc-900 border-t md:border border-zinc-700 w-full max-w-2xl h-[90vh] md:h-auto md:max-h-[90vh] rounded-t-xl md:rounded-xl shadow-2xl overflow-hidden flex flex-col">
                
                {/* HEADER */}
                <div className="flex justify-between items-center p-4 border-b border-zinc-800 bg-zinc-950 shrink-0">
                    <div className="flex items-center gap-2">
                        {view !== 'LIST' && (
                            <button onClick={() => setView('LIST')} className="bg-zinc-800 p-2 rounded hover:bg-zinc-700 mr-2">
                                <ArrowLeft size={16} />
                            </button>
                        )}
                        <h2 className="text-white font-bold text-lg flex items-center gap-2">
                            <Settings size={20}/> {view === 'LIST' ? 'Sources' : 'Add Source'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white bg-zinc-800 p-2 rounded-full"><X size={20}/></button>
                </div>
                
                {/* CONTENT */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    
                    {/* VIEW: LIST */}
                    {view === 'LIST' && (
                        <>
                            {/* Toolbar */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                                <button onClick={handleDiscover} className="bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 shadow-lg">
                                    <RefreshCw size={18}/> Auto-Discover Devices
                                </button>
                                <button onClick={() => setView('SELECT_TYPE')} className="bg-zinc-800 hover:bg-zinc-700 text-white py-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 border border-zinc-700 shadow-lg">
                                    <Plus size={18}/> Add Manually
                                </button>
                            </div>

                            <div className="space-y-2">
                                {sources.map(source => (
                                    <div key={source.id} className="bg-black border border-zinc-800 rounded-lg p-3 flex items-center gap-3 group hover:border-zinc-600 transition-colors">
                                        {/* Icon */}
                                        <div className="w-10 flex flex-col items-center justify-center text-zinc-500 shrink-0">
                                            {getIcon(source.type)}
                                        </div>

                                        {/* Content */}
                                        {editingId === source.id ? (
                                            <div className="flex-1 flex flex-col gap-2">
                                                <input 
                                                    value={editData.name} 
                                                    onChange={e => setEditData({...editData, name: e.target.value})}
                                                    className="w-full bg-zinc-800 border border-zinc-600 rounded px-2 py-2 text-white text-sm"
                                                    placeholder="Name"
                                                    autoFocus
                                                />
                                                <div className="flex gap-2">
                                                    <input 
                                                        value={editData.tag} 
                                                        onChange={e => setEditData({...editData, tag: e.target.value})}
                                                        className="flex-1 bg-zinc-800 border border-zinc-600 rounded px-2 py-2 text-white text-sm"
                                                        placeholder="Tag (e.g. CAM 1)"
                                                    />
                                                    <button onClick={() => handleSaveEdit(source.id)} className="bg-green-600 text-white px-3 rounded hover:bg-green-500">
                                                        <Save size={16}/>
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex-1 min-w-0">
                                                <div className="text-white font-bold truncate text-base">{source.displayName}</div>
                                                <div className="text-xs text-zinc-500 truncate">{source.id} • {source.type}</div>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 shrink-0">
                                            {source.originTag && !editingId && (
                                                <span className="bg-blue-900/50 text-blue-300 text-[9px] px-2 py-0.5 rounded border border-blue-900 hidden sm:inline-block">
                                                    {source.originTag}
                                                </span>
                                            )}
                                            {editingId !== source.id && (
                                                <button onClick={() => handleEdit(source)} className="text-zinc-400 hover:text-white p-2 bg-zinc-800 rounded">
                                                    <Settings size={18}/>
                                                </button>
                                            )}
                                            {onRemove && source.id !== 'safe_source' && (
                                                <button onClick={() => onRemove(source.id)} className="text-zinc-400 hover:text-red-500 p-2 bg-zinc-800 rounded">
                                                    <Trash2 size={18}/>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* VIEW: SELECT TYPE */}
                    {view === 'SELECT_TYPE' && (
                        <div className="grid grid-cols-1 gap-3">
                            <button onClick={handleDiscover} className="bg-zinc-800 p-5 rounded-xl border border-zinc-700 flex items-center gap-4 hover:bg-zinc-700">
                                <RefreshCw size={24} className="text-blue-500"/>
                                <div className="text-left">
                                    <div className="font-bold text-white">Discover Hardware</div>
                                    <div className="text-xs text-zinc-500">USB Cameras, Capture Cards, Mics</div>
                                </div>
                            </button>
                            <button onClick={() => { setNewSourceType(SourceType.RTSP); setView('ADD_MANUAL'); }} className="bg-zinc-800 p-5 rounded-xl border border-zinc-700 flex items-center gap-4 hover:bg-zinc-700">
                                <Globe size={24} className="text-purple-500"/>
                                <div className="text-left">
                                    <div className="font-bold text-white">Network Stream</div>
                                    <div className="text-xs text-zinc-500">RTSP, SRT, HLS, IP Cam</div>
                                </div>
                            </button>
                            <button onClick={() => { setNewSourceType(SourceType.NDI); setView('ADD_MANUAL'); }} className="bg-zinc-800 p-5 rounded-xl border border-zinc-700 flex items-center gap-4 hover:bg-zinc-700">
                                <Link size={24} className="text-amber-500"/>
                                <div className="text-left">
                                    <div className="font-bold text-white">NDI Source</div>
                                    <div className="text-xs text-zinc-500">Local Network Video</div>
                                </div>
                            </button>
                            <button onClick={handleAddScreen} className="bg-zinc-800 p-5 rounded-xl border border-zinc-700 flex items-center gap-4 hover:bg-zinc-700">
                                <Monitor size={24} className="text-green-500"/>
                                <div className="text-left">
                                    <div className="font-bold text-white">Screen Capture</div>
                                    <div className="text-xs text-zinc-500">Browser Tab, Window, Desktop</div>
                                </div>
                            </button>
                        </div>
                    )}

                    {/* VIEW: ADD MANUAL */}
                    {view === 'ADD_MANUAL' && (
                        <div className="bg-zinc-800 p-4 rounded-lg border border-zinc-700 space-y-4">
                            <div className="text-sm font-bold text-zinc-400 uppercase">Configuration: {newSourceType}</div>
                            <div>
                                <label className="text-xs text-zinc-500 block mb-1">Display Name</label>
                                <input 
                                    value={newSourceLabel}
                                    onChange={e => setNewSourceLabel(e.target.value)}
                                    className="w-full bg-black border border-zinc-600 rounded p-3 text-white text-base"
                                    placeholder="e.g. Remote Guest"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-zinc-500 block mb-1">Stream URL / IP</label>
                                <input 
                                    value={newSourceUrl}
                                    onChange={e => setNewSourceUrl(e.target.value)}
                                    className="w-full bg-black border border-zinc-600 rounded p-3 text-white text-base font-mono"
                                    placeholder="rtsp://..."
                                />
                            </div>
                            <button onClick={handleAddManual} disabled={!newSourceUrl} className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white py-4 rounded-lg font-bold mt-2 shadow-lg">
                                Add Source
                            </button>
                        </div>
                    )}

                    {/* VIEW: DISCOVERING */}
                    {view === 'DISCOVERING' && (
                        <div className="flex flex-col items-center justify-center h-40 gap-4">
                            <RefreshCw size={40} className="text-blue-500 animate-spin"/>
                            <div className="text-white font-bold">Scanning Bus...</div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};
