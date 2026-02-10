
import React, { useState, useEffect } from 'react';
import { requestMediaPermissions, scanVideoDevices, scanAudioDevices, validateSignal, getScreenCaptureStream } from '../services/deviceService';
import { VideoSource, AudioChannel, SourceType, RTMPConfig, AudioRole } from '../types';

interface SetupWizardProps {
  onComplete: (sources: VideoSource[], audio: AudioChannel[], rtmp: RTMPConfig[]) => void;
}

const SetupWizard: React.FC<SetupWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [scanning, setScanning] = useState(false);
  
  // Data State
  const [scannedVideo, setScannedVideo] = useState<VideoSource[]>([]);
  const [scannedAudio, setScannedAudio] = useState<AudioChannel[]>([]);
  const [manualSources, setManualSources] = useState<VideoSource[]>([]);
  const [rtmpConfig, setRtmpConfig] = useState<RTMPConfig>({ url: "rtmp://a.rtmp.youtube.com/live2", key: "", enabled: true, status: 'IDLE' });
  
  // Manual Input State
  const [manualIp, setManualIp] = useState("rtsp://192.168.1.100:554/live");
  const [manualLabel, setManualLabel] = useState("Remote Cam 1");
  const [manualType, setManualType] = useState<SourceType>(SourceType.NDI);

  // --- STEP 1: PERMISSIONS & SCAN ---
  const startScan = async () => {
    const granted = await requestMediaPermissions();
    if (granted) {
      setStep(2);
      setScanning(true);
      
      const v = await scanVideoDevices();
      const a = await scanAudioDevices();
      
      setScannedVideo(v);
      setScannedAudio(a);
      setScanning(false);

      // Trigger Async Validation
      validateSources(v);
    } else {
      alert("Camera/Mic permissions are required for Studio Mode.");
    }
  };

  const validateSources = async (sources: VideoSource[]) => {
    const updated = [...sources];
    for (let i = 0; i < updated.length; i++) {
      if (updated[i].deviceId) {
        const isValid = await validateSignal(updated[i].deviceId!, 'video');
        updated[i].status = isValid ? 'OK' : 'NO_SIGNAL';
        // Force update to show status in UI
        setScannedVideo([...updated]); 
      }
    }
  };

  // --- STEP 3: MANUAL SOURCES ---
  const addManualSource = () => {
    const newSource: VideoSource = {
      id: `ip_${Date.now()}`,
      label: manualLabel,
      displayName: manualLabel,
      type: manualType,
      previewUrl: '', 
      active: true,
      status: 'CONNECTING'
    };
    setManualSources([...manualSources, newSource]);
  };

  const addScreenShare = async () => {
    try {
      // We just test if it works, we don't hold the stream here (BroadcastEngine handles it)
      // Actually for the registry, we just mark it as a SCREEN source.
      // The Engine will request the stream when "Active".
      const newSource: VideoSource = {
        id: `scr_${Date.now()}`,
        label: "Screen Share 1",
        displayName: "Screen Share",
        type: SourceType.SCREEN,
        active: true,
        status: 'OK'
      };
      setManualSources([...manualSources, newSource]);
    } catch (e) {
      alert("Screen sharing cancelled or not supported.");
    }
  };

  // --- FINISH ---
  const finishSetup = () => {
    const finalVideo = [...scannedVideo, ...manualSources];
    
    // Fallback
    if (finalVideo.length === 0) {
       finalVideo.push({ id: 'dummy1', label: 'Color Bars', displayName: 'Color Bars', type: SourceType.MEDIA, previewUrl: '', active: true, status: 'NO_SIGNAL' });
    }

    // Audio Defaults
    const finalAudio = [...scannedAudio];
    if (!finalAudio.find(c => c.id === 'master')) {
      finalAudio.unshift({ 
        id: 'master', 
        label: 'MASTER', 
        role: AudioRole.MASTER, 
        level: 80, 
        muted: false, 
        solo: false, 
        afv: false, 
        peak: 0,
        gain: 0,
        pan: 0,
        eq: { lowCut: 80, low: 0, lowMid: 0, highMid: 0, high: 0 },
        dynamics: {
            compressor: { threshold: -20, ratio: 4, attack: 10, release: 100, active: false },
            gate: { threshold: -45, active: false },
            limiter: { threshold: -1, active: true }
        },
        dsp: { delayMs: 0, pan: 0, inputGain: 0 },
        routing: { toMaster: true, toMonitor: true, toStream: true, toAux: false }
      });
    }

    // Save to LocalStorage
    localStorage.setItem('arcls_sources', JSON.stringify(finalVideo));
    localStorage.setItem('arcls_audio', JSON.stringify(finalAudio));
    localStorage.setItem('arcls_rtmp', JSON.stringify(rtmpConfig));

    onComplete(finalVideo, finalAudio, [rtmpConfig]);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-3xl w-full p-8 shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6 border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded flex items-center justify-center font-bold text-white shadow-lg">AR</div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-wide">STUDIO SETUP</h1>
              <p className="text-zinc-500 text-xs uppercase tracking-wider">Step {step} of 5</p>
            </div>
          </div>
          <div className="flex gap-1">
             {[1,2,3,4,5].map(i => (
                <div key={i} className={`w-3 h-3 rounded-full ${step >= i ? 'bg-blue-500' : 'bg-zinc-800'}`}></div>
             ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto mb-6 pr-2">
          
          {/* STEP 1: PERMISSIONS */}
          {step === 1 && (
            <div className="text-center py-10 space-y-6">
              <div className="text-6xl animate-bounce">🔐</div>
              <h2 className="text-xl text-white font-bold">Hardware Access</h2>
              <p className="text-zinc-400 max-w-md mx-auto">
                AR CONTROL requires access to local cameras and microphones. 
                This runs entirely in your browser (Offline-First).
              </p>
              <button onClick={startScan} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-bold text-lg shadow-lg">
                Grant Permissions & Scan
              </button>
            </div>
          )}

          {/* STEP 2: SCAN & VALIDATE */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-lg text-white">Detected Hardware</h2>
              {scanning ? (
                <div className="p-10 text-center text-zinc-500 animate-pulse bg-black rounded border border-zinc-800">
                   Scanning hardware bus...
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="bg-black p-4 rounded border border-zinc-800">
                      <h3 className="text-green-500 font-bold mb-3 text-xs uppercase flex justify-between">
                         Video Inputs <span>{scannedVideo.length}</span>
                      </h3>
                      <div className="space-y-2 max-h-40 overflow-y-auto no-scrollbar">
                        {scannedVideo.map(v => (
                          <div key={v.id} className="flex items-center justify-between text-sm text-zinc-300 bg-zinc-900 p-2 rounded">
                            <div className="flex items-center gap-2 truncate">
                               <span className={`w-2 h-2 rounded-full ${v.status === 'OK' ? 'bg-green-500' : v.status === 'VALIDATING' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'}`}></span>
                               {v.label}
                            </div>
                            {v.capabilities?.ptz && <span className="text-[9px] bg-blue-900 text-blue-200 px-1 rounded">PTZ</span>}
                          </div>
                        ))}
                      </div>
                   </div>
                   <div className="bg-black p-4 rounded border border-zinc-800">
                      <h3 className="text-blue-500 font-bold mb-3 text-xs uppercase flex justify-between">
                         Audio Inputs <span>{scannedAudio.length}</span>
                      </h3>
                      <div className="space-y-2 max-h-40 overflow-y-auto no-scrollbar">
                        {scannedAudio.map(a => (
                          <div key={a.id} className="flex items-center gap-2 text-sm text-zinc-300 bg-zinc-900 p-2 rounded">
                            <span className="text-blue-500">♪</span> {a.label}
                          </div>
                        ))}
                      </div>
                   </div>
                </div>
              )}
              <div className="flex justify-end">
                 <button onClick={() => setStep(3)} className="bg-zinc-100 hover:bg-white text-black px-6 py-2 rounded font-bold">Next Step</button>
              </div>
            </div>
          )}

          {/* STEP 3: REMOTE / MANUAL SOURCES */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-lg text-white">Add Remote Sources</h2>
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-zinc-800/50 p-4 rounded border border-zinc-700 space-y-4">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase">IP Stream / NDI</h3>
                    <div>
                       <label className="text-[10px] text-zinc-500 block mb-1">LABEL</label>
                       <input value={manualLabel} onChange={e => setManualLabel(e.target.value)} className="w-full bg-black border border-zinc-600 rounded p-2 text-white text-sm" />
                    </div>
                    <div>
                       <label className="text-[10px] text-zinc-500 block mb-1">TYPE</label>
                       <select value={manualType} onChange={e => setManualType(e.target.value as SourceType)} className="w-full bg-black border border-zinc-600 rounded p-2 text-white text-sm">
                         <option value={SourceType.NDI}>NDI (Mock)</option>
                         <option value={SourceType.IP_STREAM}>RTSP / SRT</option>
                         <option value={SourceType.WEBRTC}>WebRTC Guest</option>
                       </select>
                    </div>
                    <div>
                       <label className="text-[10px] text-zinc-500 block mb-1">URL</label>
                       <input value={manualIp} onChange={e => setManualIp(e.target.value)} className="w-full bg-black border border-zinc-600 rounded p-2 text-white text-sm font-mono" />
                    </div>
                    <button onClick={addManualSource} className="w-full bg-zinc-700 hover:bg-zinc-600 text-white py-2 rounded font-bold text-sm">Add Stream</button>
                 </div>

                 <div className="space-y-4">
                    <div className="bg-zinc-800/50 p-4 rounded border border-zinc-700 flex flex-col justify-center items-center gap-2 h-32 cursor-pointer hover:bg-zinc-700 transition-colors" onClick={addScreenShare}>
                       <span className="text-3xl">🖥️</span>
                       <span className="font-bold text-white">Add Screen Capture</span>
                       <span className="text-[10px] text-zinc-400">Browser Native API</span>
                    </div>
                    
                    {/* List of Added */}
                    <div className="bg-black p-2 rounded border border-zinc-800 h-32 overflow-y-auto no-scrollbar">
                       {manualSources.length === 0 && <div className="text-zinc-600 text-xs italic text-center mt-4">No remote sources added</div>}
                       {manualSources.map((s, i) => (
                          <div key={i} className="flex justify-between items-center text-xs text-zinc-300 py-1 border-b border-zinc-900">
                             <span>{s.label}</span>
                             <button onClick={() => setManualSources(manualSources.filter((_, idx) => idx !== i))} className="text-red-500 font-bold">×</button>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>
              
              <div className="flex justify-end gap-2">
                 <button onClick={() => setStep(2)} className="text-zinc-400 px-4 py-2 hover:text-white">Back</button>
                 <button onClick={() => setStep(4)} className="bg-zinc-100 hover:bg-white text-black px-6 py-2 rounded font-bold">Next Step</button>
              </div>
            </div>
          )}

          {/* STEP 4: AUDIO CONFIG */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-lg text-white">Audio Configuration</h2>
              <div className="bg-zinc-800/50 p-4 rounded border border-zinc-700">
                 <p className="text-sm text-zinc-400 mb-4">Select which devices should be active in the mixer by default. A Master channel will be created automatically.</p>
                 <div className="space-y-2 max-h-60 overflow-y-auto">
                    {scannedAudio.map(a => (
                       <div key={a.id} className="flex items-center gap-3 bg-black p-3 rounded border border-zinc-800">
                          <input type="checkbox" defaultChecked className="w-4 h-4 accent-blue-600" />
                          <div className="flex-1">
                             <div className="text-white font-bold text-sm">{a.label}</div>
                             <div className="text-[10px] text-zinc-500">{a.id}</div>
                          </div>
                          <div className="w-20 bg-zinc-900 h-1 rounded overflow-hidden">
                             <div className="bg-green-500 h-full w-[60%] animate-pulse"></div>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
              <div className="flex justify-end gap-2">
                 <button onClick={() => setStep(3)} className="text-zinc-400 px-4 py-2 hover:text-white">Back</button>
                 <button onClick={() => setStep(5)} className="bg-zinc-100 hover:bg-white text-black px-6 py-2 rounded font-bold">Next Step</button>
              </div>
            </div>
          )}

          {/* STEP 5: RTMP & FINISH */}
          {step === 5 && (
            <div className="space-y-6">
               <h2 className="text-lg text-white">Stream Destination</h2>
               
               <div className="bg-zinc-800/50 p-4 rounded border border-zinc-700 space-y-4">
                  <div>
                     <label className="text-xs text-zinc-400 block mb-1">RTMP Server URL</label>
                     <input 
                        value={rtmpConfig.url} 
                        onChange={e => setRtmpConfig({...rtmpConfig, url: e.target.value})}
                        className="w-full bg-black border border-zinc-600 rounded p-2 text-white text-sm font-mono" 
                     />
                  </div>
                  <div>
                     <label className="text-xs text-zinc-400 block mb-1">Stream Key</label>
                     <input 
                        type="password"
                        value={rtmpConfig.key} 
                        onChange={e => setRtmpConfig({...rtmpConfig, key: e.target.value})}
                        placeholder="••••••••••••"
                        className="w-full bg-black border border-zinc-600 rounded p-2 text-white text-sm font-mono" 
                     />
                  </div>
                  <div className="flex items-center gap-2">
                     <input 
                        type="checkbox" 
                        checked={rtmpConfig.enabled} 
                        onChange={e => setRtmpConfig({...rtmpConfig, enabled: e.target.checked})}
                        className="w-4 h-4 accent-red-600" 
                     />
                     <span className="text-sm text-zinc-300">Enable Streaming Output</span>
                  </div>
               </div>

               <div className="bg-blue-900/20 border border-blue-800 p-4 rounded text-sm text-blue-200">
                  <span className="font-bold">Summary:</span> {scannedVideo.length + manualSources.length} Video Sources, {scannedAudio.length} Audio Inputs. 
                  <br/>System is ready for Studio Mode.
               </div>

               <div className="flex justify-end gap-2">
                 <button onClick={() => setStep(4)} className="text-zinc-400 px-4 py-2 hover:text-white">Back</button>
                 <button onClick={finishSetup} className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-bold text-lg shadow-lg shadow-green-900/20">
                    Launch Studio 🚀
                 </button>
               </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SetupWizard;
