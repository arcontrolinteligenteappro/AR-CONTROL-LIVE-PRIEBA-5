
import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PTZPreset, PTZProtocol } from '../types';
import { PTZ_PRESETS } from '../constants';
import { getPTZController, IPTZController } from '../services/ptzService';
import { Crosshair, ZoomIn, ZoomOut, Save, Video, Zap, MousePointer2 } from 'lucide-react';

export const PTZControl: React.FC = () => {
  const [activeCam, setActiveCam] = useState('CAM 3');
  const [speed, setSpeed] = useState(50);
  const [zoomLevel, setZoomLevel] = useState(0); // -1 to 1 for control
  const [saveMode, setSaveMode] = useState(false);
  const controller = useRef<IPTZController>(getPTZController(PTZProtocol.SIMULATOR));
  
  // Initialize Controller (Mock Config)
  useEffect(() => {
      // In a real app, this config comes from SourceManager/GlobalState
      controller.current.connect({
          ip: '192.168.1.100',
          port: 52381,
          protocol: PTZProtocol.SIMULATOR
      });
  }, [activeCam]);

  const handleDrag = (event: any, info: any) => {
    // Normalize -1 to 1
    const x = Math.max(-1, Math.min(1, info.point.x / 50)); 
    const y = Math.max(-1, Math.min(1, info.point.y / 50));
    // Apply speed curve
    const spd = speed / 100;
    controller.current.move(x * spd, y * spd * -1); // Invert Y for intuitive control
  };

  const handleDragEnd = () => {
    controller.current.stop();
  };

  const handleZoomChange = (val: number) => {
      setZoomLevel(val);
      controller.current.zoom(val * (speed / 100));
      // Auto-center spring back logic would go here if slider wasn't sticky
      // For this UI, we treat slider as a "speed throttle" for zoom (sticky 0)
      if (val === 0) controller.current.stop(); // Or specific zoom stop
  };

  const handlePresetClick = (id: string) => {
      if (saveMode) {
          controller.current.savePreset(id);
          setSaveMode(false); // Auto-exit save mode
      } else {
          controller.current.recallPreset(id);
      }
  };

  return (
    <div className="h-full flex flex-col bg-zinc-900 border border-zinc-800 rounded p-2">
       {/* Header */}
       <div className="flex justify-between items-center mb-2 border-b border-zinc-800 pb-2">
          <div className="flex items-center gap-2">
             <Crosshair size={14} className="text-blue-500"/>
             <span className="text-xs font-bold text-white">PTZ CONTROLLER</span>
          </div>
          <div className="flex gap-1">
             <button className="text-[9px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2 py-1 rounded border border-zinc-700">{activeCam}</button>
             <button className="text-[9px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2 py-1 rounded border border-zinc-700"><Video size={10}/></button>
          </div>
       </div>

       <div className="flex-1 flex gap-2 min-h-0">
          
          {/* LEFT: Joystick */}
          <div className="flex-1 bg-black rounded border border-zinc-800 relative flex items-center justify-center overflow-hidden">
             <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 opacity-10 pointer-events-none">
                {[...Array(16)].map((_,i) => <div key={i} className="border border-zinc-700"></div>)}
             </div>
             
             {/* Joystick Base */}
             <div className="w-24 h-24 rounded-full bg-zinc-900 border border-zinc-700 shadow-inner flex items-center justify-center relative">
                <motion.div 
                   className="w-12 h-12 rounded-full bg-gradient-to-b from-zinc-700 to-zinc-800 border-t border-zinc-600 shadow-lg cursor-grab active:cursor-grabbing z-10 flex items-center justify-center"
                   drag
                   dragConstraints={{ left: -35, right: 35, top: -35, bottom: 35 }}
                   dragElastic={0.1}
                   onDrag={handleDrag}
                   onDragEnd={handleDragEnd}
                   whileTap={{ scale: 0.95 }}
                >
                   <MousePointer2 size={16} className="text-blue-500 opacity-50" />
                </motion.div>
             </div>
             
             {/* Pan/Tilt Speed Slider */}
             <div className="absolute left-2 top-2 bottom-2 w-2 bg-zinc-900 rounded-full border border-zinc-800 flex flex-col justify-end overflow-hidden">
                <div className="absolute bottom-0 w-full bg-blue-600 transition-all" style={{ height: `${speed}%` }}></div>
                <input 
                   type="range" min="1" max="100" 
                   value={speed} onChange={e => setSpeed(Number(e.target.value))}
                   className="absolute inset-0 w-full h-full opacity-0 cursor-ns-resize"
                   title={`Speed: ${speed}%`}
                />
             </div>
             <span className="absolute left-5 bottom-2 text-[8px] text-zinc-500 font-mono -rotate-90 origin-left">SPEED</span>
          </div>

          {/* RIGHT: Zoom & Presets */}
          <div className="w-24 flex flex-col gap-2">
             
             {/* Zoom Slider (Vertical) */}
             <div className="flex-1 bg-zinc-950 rounded border border-zinc-800 relative flex flex-col items-center py-2">
                 <ZoomIn size={12} className="text-zinc-500 mb-1"/>
                 <div className="flex-1 w-2 bg-zinc-800 rounded-full relative">
                     {/* Center Marker */}
                     <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-zinc-600"></div>
                     {/* Thumb */}
                     <div 
                        className="absolute w-4 h-4 bg-zinc-400 rounded-full left-1/2 -translate-x-1/2 shadow-sm border border-black"
                        style={{ top: `${50 - (zoomLevel * 45)}%` }} // Map -1..1 to position
                     ></div>
                     <input 
                        type="range" min="-1" max="1" step="0.1"
                        value={zoomLevel} 
                        onChange={e => handleZoomChange(Number(e.target.value))}
                        onMouseUp={() => handleZoomChange(0)}
                        onTouchEnd={() => handleZoomChange(0)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-ns-resize z-20"
                     />
                 </div>
                 <ZoomOut size={12} className="text-zinc-500 mt-1"/>
             </div>

             {/* Presets Grid */}
             <div className="h-1/2 flex flex-col gap-1">
                <button 
                    onClick={() => setSaveMode(!saveMode)}
                    className={`w-full py-1 rounded text-[9px] font-bold border flex items-center justify-center gap-1 ${saveMode ? 'bg-red-600 text-white border-red-500 animate-pulse' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}
                >
                    <Save size={10} /> {saveMode ? 'SELECT SLOT' : 'SET PRESET'}
                </button>
                <div className="flex-1 overflow-y-auto no-scrollbar grid grid-cols-2 gap-1 content-start">
                    {PTZ_PRESETS.map(p => (
                    <button 
                        key={p.id} 
                        onClick={() => handlePresetClick(p.id)}
                        className={`aspect-square bg-zinc-800 hover:bg-zinc-700 text-[9px] rounded border border-zinc-700 flex flex-col items-center justify-center gap-0.5 group relative overflow-hidden`}
                    >
                        <span className="font-bold text-lg text-zinc-600 group-hover:text-blue-400">{p.id}</span>
                        {saveMode && <div className="absolute inset-0 bg-red-500/20 border-2 border-red-500 animate-pulse rounded"></div>}
                    </button>
                    ))}
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};
