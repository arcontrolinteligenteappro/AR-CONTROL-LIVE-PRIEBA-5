
import { VideoSource, AudioChannel, SourceType, SourceCapabilities, AudioRole } from '../types';

export const requestMediaPermissions = async (): Promise<boolean> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    stream.getTracks().forEach(t => t.stop());
    return true;
  } catch (err) {
    console.error("Permission denied or device missing", err);
    return false;
  }
};

const getCapabilities = (track: MediaStreamTrack): SourceCapabilities => {
  const settings = track.getSettings();
  const caps = (track.getCapabilities && track.getCapabilities()) || {};

  return {
    width: settings.width || 1280,
    height: settings.height || 720,
    frameRate: settings.frameRate || 30,
    aspectRatio: settings.aspectRatio || 1.77,
    ptz: ('pan' in caps || 'tilt' in caps || 'zoom' in caps),
    audio: false,
    facingMode: settings.facingMode as 'user' | 'environment' | undefined
  };
};

// Robust stream getter with fallbacks
export const getStreamForDevice = async (deviceId: string, facingMode?: 'user' | 'environment'): Promise<MediaStream | null> => {
  const baseConstraints: any = {
    deviceId: facingMode ? undefined : { exact: deviceId },
    facingMode: facingMode
  };

  // 1. Try HD (Ideal)
  try {
    return await navigator.mediaDevices.getUserMedia({
      video: { ...baseConstraints, width: { ideal: 1280 }, height: { ideal: 720 } }
    });
  } catch (err) {
    console.warn(`HD constraints failed for ${deviceId}, retrying with SD...`);
  }

  // 2. Try SD (Fallback)
  try {
    return await navigator.mediaDevices.getUserMedia({
      video: { ...baseConstraints, width: { ideal: 640 }, height: { ideal: 480 } }
    });
  } catch (err) {
    console.warn(`SD constraints failed for ${deviceId}, retrying native...`);
  }

  // 3. Try Native/Low (Last Resort)
  try {
    return await navigator.mediaDevices.getUserMedia({
      video: baseConstraints
    });
  } catch (err) {
    console.error(`CRITICAL: Could not start video source ${deviceId}`, err);
    return null;
  }
};

// Validates signal by briefly checking if a stream can flow data
export const validateSignal = async (deviceId: string, type: 'video' | 'audio'): Promise<boolean> => {
  try {
    let stream: MediaStream | null = null;
    
    if (type === 'video') {
       stream = await getStreamForDevice(deviceId);
    } else {
       stream = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: { exact: deviceId } } });
    }
    
    if (!stream) return false;

    if (type === 'video') {
      const track = stream.getVideoTracks()[0];
      // Check if track is live
      const healthy = track.readyState === 'live';
      track.stop();
      return healthy;
    } else {
      const track = stream.getAudioTracks()[0];
      const healthy = track.readyState === 'live';
      track.stop();
      return healthy;
    }
  } catch (e) {
    console.warn(`Validation failed for ${deviceId}`, e);
    return false;
  }
};

export const scanVideoDevices = async (): Promise<VideoSource[]> => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(d => d.kind === 'videoinput');
    
    const results: VideoSource[] = [];

    // Map to Source objects
    for (let i = 0; i < videoDevices.length; i++) {
      const d = videoDevices[i];
      let caps: SourceCapabilities | undefined;
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { deviceId: { exact: d.deviceId } } 
        });
        caps = getCapabilities(stream.getVideoTracks()[0]);
        stream.getTracks().forEach(t => t.stop());
      } catch (e) {
        console.log(`Could not probe capabilities for ${d.label}`);
      }

      results.push({
        id: `cam_${i + 1}_${d.deviceId.slice(0, 4)}`,
        deviceId: d.deviceId,
        label: d.label || `Camera ${i + 1}`,
        displayName: d.label || `Camera ${i + 1}`,
        type: SourceType.CAMERA,
        active: true,
        status: 'VALIDATING', // Will be updated by UI validation step
        capabilities: caps
      });
    }

    return results;
  } catch (err) {
    console.error("Error scanning video devices", err);
    return [];
  }
};

export const scanAudioDevices = async (): Promise<AudioChannel[]> => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const audioDevices = devices.filter(d => d.kind === 'audioinput');

    return audioDevices.map((d, index) => ({
      id: `mic_${index + 1}_${d.deviceId.slice(0, 4)}`,
      deviceId: d.deviceId,
      label: d.label || `Microphone ${index + 1}`,
      role: AudioRole.MIC,
      level: 75,
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
    }));
  } catch (err) {
    console.error("Error scanning audio devices", err);
    return [];
  }
};

export const getScreenCaptureStream = async (): Promise<MediaStream | null> => {
  try {
    // @ts-ignore
    if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
       // @ts-ignore
       return await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
    } else {
      throw new Error("Screen capture not supported on this device.");
    }
  } catch (err) {
    console.error("Screen capture failed", err);
    return null;
  }
};

// Helper to toggle camera direction (mobile feature)
export const switchCameraFacingMode = async (currentStream: MediaStream): Promise<MediaStream | null> => {
  const track = currentStream.getVideoTracks()[0];
  const settings = track.getSettings();
  const currentMode = settings.facingMode;
  
  // Toggle
  const newMode = currentMode === 'user' ? 'environment' : 'user';
  
  track.stop();
  return getStreamForDevice('', newMode);
};
