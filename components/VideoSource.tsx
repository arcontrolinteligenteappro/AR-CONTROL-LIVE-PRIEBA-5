
import React, { useEffect, useRef } from 'react';
import { VideoSource, SourceType } from '../types';
import { getStreamForDevice, getScreenCaptureStream } from '../services/deviceService';
import { AlertTriangle } from 'lucide-react';

interface VideoSourceProps {
  source: VideoSource;
  isPgm?: boolean;
  isPvw?: boolean;
  onClick?: () => void;
  labelPosition?: 'top' | 'bottom';
  showLabel?: boolean;
  compact?: boolean;
  onUpdateStream?: (stream: MediaStream) => void; 
}

const VideoSourceDisplay: React.FC<VideoSourceProps> = ({ 
  source, 
  isPgm, 
  isPvw, 
  onClick, 
  labelPosition = 'bottom',
  showLabel = true,
  compact = false,
  onUpdateStream
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const borderColor = isPgm ? 'border-broadcast-pgm' : isPvw ? 'border-broadcast-pvw' : 'border-zinc-700';
  const borderWidth = isPgm || isPvw ? 'border-4' : 'border';

  // --- CAMERA STREAM HANDLING ---
  useEffect(() => {
    let activeStream: MediaStream | null = source.stream || null;
    let mounted = true;

    const attachStream = async () => {
      if (source.stream) {
        if (videoRef.current && mounted) {
           videoRef.current.srcObject = source.stream;
           // If failsafe, we pause to simulate freeze (simplistic approach)
           // In real app, we'd draw to canvas and stop updating.
           if (source.status === 'FAILSAFE') {
               videoRef.current.pause();
           } else {
               videoRef.current.play().catch(e => console.debug("Auto-play prevented", e));
           }
        }
        return;
      }

      if (source.type === SourceType.CAMERA && source.deviceId) {
        try {
          const stream = await getStreamForDevice(source.deviceId);
          if (mounted && stream) {
            activeStream = stream;
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
              if (source.status === 'FAILSAFE') {
                  videoRef.current.pause();
              } else {
                  videoRef.current.play().catch(e => console.debug("Auto-play prevented", e));
              }
            }
          }
        } catch (e) {
          console.error("Unexpected stream attach error", e);
        }
      }
    };

    attachStream();
    return () => { mounted = false; };
  }, [source.deviceId, source.type, source.stream, source.status]);

  // --- SCREEN SHARE HANDLING ---
  const handleStartScreenShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const stream = await getScreenCaptureStream();
    if (stream && onUpdateStream) onUpdateStream(stream);
  };
  
  return (
    <div 
      className={`relative bg-black rounded overflow-hidden cursor-pointer transition-all duration-100 ${borderWidth} ${borderColor} ${compact ? 'aspect-video' : 'h-full'} group`}
      onClick={onClick}
    >
      {/* RENDER LOGIC */}
      {source.type === SourceType.SCREEN && !source.stream ? (
         <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 border border-zinc-800 text-zinc-400">
            <span className="text-2xl mb-2">🖥️</span>
            <span className="text-[10px] mb-2">{source.displayName}</span>
            <button onClick={handleStartScreenShare} className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] px-3 py-1 rounded font-bold">SELECT WINDOW</button>
         </div>
      ) : (source.type === SourceType.CAMERA && (source.deviceId || source.stream)) || (source.type === SourceType.SCREEN && source.stream) ? (
        <>
            <video ref={videoRef} className={`w-full h-full object-cover ${source.status === 'FAILSAFE' ? 'grayscale opacity-50' : ''}`} muted playsInline />
            {source.status === 'FAILSAFE' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                    <div className="flex flex-col items-center animate-pulse">
                        <AlertTriangle size={32} className="text-red-500 mb-2" />
                        <span className="text-red-500 font-bold bg-black px-2 text-xs">SIGNAL LOST - LAST FRAME</span>
                    </div>
                </div>
            )}
        </>
      ) : source.previewUrl ? (
        <img src={source.previewUrl} alt={source.label} className="w-full h-full object-cover opacity-90 hover:opacity-100" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-500 font-mono flex-col border border-zinc-800">
           <span className="text-xl mb-1 animate-pulse text-red-900">⚠</span>
           <span className="text-[10px]">NO SIGNAL</span>
        </div>
      )}

      {/* Tally Light */}
      {isPgm && <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-broadcast-pgm shadow-[0_0_10px_rgba(220,38,38,0.8)] animate-pulse z-20" />}
      
      {/* V8.1 Enhanced Label */}
      {showLabel && (
        <div className={`absolute ${labelPosition === 'top' ? 'top-0' : 'bottom-0'} left-0 w-full bg-black/70 backdrop-blur-sm px-2 py-1 z-20 flex justify-between items-center`}>
          <div className="flex flex-col overflow-hidden">
             <span className="text-xs font-bold font-sans text-white truncate">{source.displayName}</span>
             {!compact && <span className="text-[8px] text-zinc-400 font-mono">{source.label}</span>}
          </div>
          {source.originTag && (
             <span className="text-[8px] bg-blue-900 text-blue-200 px-1 rounded ml-1 whitespace-nowrap">{source.originTag}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoSourceDisplay;
