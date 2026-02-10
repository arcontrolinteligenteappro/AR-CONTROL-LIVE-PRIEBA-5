
import React from 'react';
import { ScoreState } from '../types';

export const BaseballScorebug: React.FC<{ data: ScoreState }> = ({ data }) => {
    return (
        <div className="absolute top-8 left-8 bg-zinc-900 border-t-4 border-blue-600 rounded-b shadow-2xl flex overflow-hidden z-50">
            {/* TEAMS */}
            <div className="flex flex-col">
                <div className="flex items-center bg-zinc-800 px-3 py-1 border-b border-zinc-700 min-w-[100px] justify-between">
                    <span className="text-white font-bold text-lg">{data.guestName}</span>
                    <span className="text-yellow-400 font-mono text-xl font-bold">{data.guestScore}</span>
                </div>
                <div className="flex items-center bg-zinc-800 px-3 py-1 min-w-[100px] justify-between">
                    <span className="text-white font-bold text-lg">{data.homeName}</span>
                    <span className="text-yellow-400 font-mono text-xl font-bold">{data.homeScore}</span>
                </div>
            </div>

            {/* INNING / BASES */}
            <div className="bg-gradient-to-b from-zinc-700 to-zinc-900 px-4 flex flex-col items-center justify-center border-l border-zinc-600 min-w-[80px]">
                
                {/* Diamond Visualization */}
                <div className="relative w-8 h-8 mb-1 rotate-45 mt-2">
                    {/* 2nd Base */}
                    <div className={`absolute top-0 right-0 w-3 h-3 border border-zinc-500 ${data.bases?.[1] ? 'bg-yellow-400' : 'bg-zinc-800'}`}></div>
                    {/* 1st Base */}
                    <div className={`absolute bottom-0 right-0 w-3 h-3 border border-zinc-500 ${data.bases?.[0] ? 'bg-yellow-400' : 'bg-zinc-800'}`}></div>
                    {/* 3rd Base */}
                    <div className={`absolute top-0 left-0 w-3 h-3 border border-zinc-500 ${data.bases?.[2] ? 'bg-yellow-400' : 'bg-zinc-800'}`}></div>
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-zinc-300 mb-1">
                    <span className={data.inningTop ? "text-yellow-400" : "text-zinc-600"}>▲</span>
                    <span>{data.period}</span>
                    <span className={!data.inningTop ? "text-yellow-400" : "text-zinc-600"}>▼</span>
                </div>
            </div>

            {/* COUNT */}
            <div className="bg-black/90 px-3 flex flex-col justify-center items-center min-w-[80px] border-l border-zinc-700">
                <div className="flex gap-1 text-[10px] text-zinc-500 font-bold uppercase mb-1 w-full justify-between">
                    <span>B</span>
                    <div className="flex gap-0.5">
                        {[1,2,3,4].map(i => <div key={i} className={`w-1.5 h-1.5 rounded-full ${i <= (data.balls||0) ? 'bg-green-500' : 'bg-zinc-700'}`}></div>)}
                    </div>
                </div>
                <div className="flex gap-1 text-[10px] text-zinc-500 font-bold uppercase mb-1 w-full justify-between">
                    <span>S</span>
                    <div className="flex gap-0.5">
                        {[1,2,3].map(i => <div key={i} className={`w-1.5 h-1.5 rounded-full ${i <= (data.strikes||0) ? 'bg-yellow-500' : 'bg-zinc-700'}`}></div>)}
                    </div>
                </div>
                <div className="flex gap-1 text-[10px] text-zinc-500 font-bold uppercase w-full justify-between">
                    <span>O</span>
                    <div className="flex gap-0.5">
                        {[1,2,3].map(i => <div key={i} className={`w-1.5 h-1.5 rounded-full ${i <= (data.outs||0) ? 'bg-red-500' : 'bg-zinc-700'}`}></div>)}
                    </div>
                </div>
            </div>
        </div>
    );
};
