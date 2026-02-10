
import React, { useState } from 'react';
import { SportProfile, SportAction } from '../types';
import { SPORTS_PROFILES } from '../constants';
import { Save, Plus, Trash2, Layout } from 'lucide-react';

export const ScoreboardDesigner: React.FC<{
    onSave: (profile: SportProfile) => void;
    onClose: () => void;
}> = ({ onSave, onClose }) => {
    const [profile, setProfile] = useState<SportProfile>({
        id: `custom_${Date.now()}`,
        name: 'New Sport',
        type: 'generic',
        template: 'type_a',
        layoutStyle: 'compact_box',
        clockType: 'count_up',
        defaultDuration: 30,
        periods: 2,
        actions: []
    });

    const addAction = () => {
        const newAction: SportAction = {
            id: `act_${Date.now()}`,
            label: 'NEW ACTION',
            type: 'score',
            target: 'home',
            value: 1,
            color: 'zinc'
        };
        setProfile({...profile, actions: [...profile.actions, newAction]});
    };

    const updateAction = (index: number, field: keyof SportAction, value: any) => {
        const updated = [...profile.actions];
        updated[index] = { ...updated[index], [field]: value };
        setProfile({...profile, actions: updated});
    };

    return (
        <div className="absolute inset-0 bg-zinc-950 z-[100] flex flex-col p-4">
            <div className="flex justify-between items-center mb-4 border-b border-zinc-800 pb-2">
                <h2 className="text-xl font-bold text-white flex items-center gap-2"><Layout size={20}/> Scoreboard Designer V7</h2>
                <div className="flex gap-2">
                    <button onClick={onClose} className="text-zinc-400 hover:text-white px-4">Cancel</button>
                    <button onClick={() => { onSave(profile); onClose(); }} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded font-bold flex items-center gap-2">
                        <Save size={16} /> Save Profile
                    </button>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-4 overflow-hidden">
                {/* SETTINGS */}
                <div className="bg-zinc-900 p-4 rounded border border-zinc-800 overflow-y-auto">
                    <h3 className="text-sm font-bold text-zinc-400 uppercase mb-4">General Settings</h3>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs text-zinc-500 block mb-1">Sport Name</label>
                            <input value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="w-full bg-black border border-zinc-700 rounded p-2 text-white" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-zinc-500 block mb-1">Clock Type</label>
                                <select value={profile.clockType} onChange={e => setProfile({...profile, clockType: e.target.value as any})} className="w-full bg-black border border-zinc-700 rounded p-2 text-white">
                                    <option value="count_up">Count Up</option>
                                    <option value="count_down">Count Down</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-zinc-500 block mb-1">Layout</label>
                                <select value={profile.layoutStyle} onChange={e => setProfile({...profile, layoutStyle: e.target.value as any})} className="w-full bg-black border border-zinc-700 rounded p-2 text-white">
                                    <option value="compact_box">Compact Box</option>
                                    <option value="lower_bar">Lower Bar</option>
                                    <option value="minimal">Minimal</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-between items-center mb-2">
                         <h3 className="text-sm font-bold text-zinc-400 uppercase">Actions / Buttons</h3>
                         <button onClick={addAction} className="text-xs bg-green-700 text-white px-2 py-1 rounded flex items-center gap-1"><Plus size={12}/> Add</button>
                    </div>
                    
                    <div className="space-y-2">
                        {profile.actions.map((act, idx) => (
                            <div key={act.id} className="bg-black p-2 rounded border border-zinc-800 grid grid-cols-12 gap-2 items-center">
                                <input value={act.label} onChange={e => updateAction(idx, 'label', e.target.value)} className="col-span-3 bg-zinc-900 text-xs text-white p-1 rounded" placeholder="Label" />
                                <select value={act.type} onChange={e => updateAction(idx, 'type', e.target.value)} className="col-span-3 bg-zinc-900 text-xs text-white p-1 rounded">
                                    <option value="score">Score</option>
                                    <option value="foul">Foul</option>
                                    <option value="timeout">Timeout</option>
                                    <option value="period">Period</option>
                                </select>
                                <select value={act.target} onChange={e => updateAction(idx, 'target', e.target.value)} className="col-span-2 bg-zinc-900 text-xs text-white p-1 rounded">
                                    <option value="home">Home</option>
                                    <option value="guest">Guest</option>
                                    <option value="game">Game</option>
                                </select>
                                <input type="number" value={act.value} onChange={e => updateAction(idx, 'value', parseInt(e.target.value))} className="col-span-2 bg-zinc-900 text-xs text-white p-1 rounded" />
                                <button onClick={() => {
                                    const newActions = [...profile.actions];
                                    newActions.splice(idx, 1);
                                    setProfile({...profile, actions: newActions});
                                }} className="col-span-1 text-red-500 flex justify-center"><Trash2 size={14}/></button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* PREVIEW */}
                <div className="bg-zinc-900 p-4 rounded border border-zinc-800 flex flex-col items-center justify-center relative bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                    <div className="absolute top-2 left-2 text-xs text-zinc-500 font-bold uppercase">UI Preview</div>
                    
                    {/* Mock Overlay */}
                    <div className="mb-10 scale-125 origin-center">
                         {profile.layoutStyle === 'compact_box' && (
                             <div className="flex bg-black border border-zinc-600 rounded overflow-hidden shadow-2xl">
                                 <div className="bg-zinc-800 px-3 py-1 text-center border-r border-zinc-700">
                                     <div className="text-[10px] text-zinc-400 font-bold">HOME</div>
                                     <div className="text-xl font-bold text-white">0</div>
                                 </div>
                                 <div className="bg-black/80 px-2 py-1 text-center flex flex-col justify-center">
                                     <div className="text-sm font-mono text-green-500 font-bold">12:00</div>
                                 </div>
                                 <div className="bg-zinc-800 px-3 py-1 text-center border-l border-zinc-700">
                                     <div className="text-[10px] text-zinc-400 font-bold">GUEST</div>
                                     <div className="text-xl font-bold text-white">0</div>
                                 </div>
                             </div>
                         )}
                    </div>

                    {/* Mock Controller */}
                    <div className="w-64 bg-zinc-950 border border-zinc-700 rounded p-2 grid grid-cols-2 gap-2">
                        <div className="col-span-2 text-center text-xs text-zinc-500 border-b border-zinc-800 pb-1 mb-1">{profile.name} Controller</div>
                        {profile.actions.slice(0, 6).map(a => (
                            <button key={a.id} className="bg-zinc-800 text-zinc-300 text-[10px] font-bold py-2 rounded border border-zinc-700">
                                {a.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
