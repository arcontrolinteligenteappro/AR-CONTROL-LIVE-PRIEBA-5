
import { MidiDevice } from '../types';

export class MidiService {
  private static instance: MidiService;
  private access: any = null;
  private listeners: ((e: any) => void)[] = [];

  private constructor() {}

  static getInstance(): MidiService {
    if (!MidiService.instance) {
      MidiService.instance = new MidiService();
    }
    return MidiService.instance;
  }

  async initialize(): Promise<boolean> {
    // @ts-ignore
    if (!navigator.requestMIDIAccess) {
      console.warn("WebMIDI not supported");
      return false;
    }

    try {
      // @ts-ignore
      this.access = await navigator.requestMIDIAccess();
      // @ts-ignore
      this.access.inputs.forEach((input) => {
        // @ts-ignore
        input.onmidimessage = (e) => this.handleMessage(e);
      });
      // @ts-ignore
      this.access.onstatechange = (e) => console.log("MIDI State Change", e);
      console.log("MIDI Initialized", this.access.inputs.size, "devices found");
      return true;
    } catch (e) {
      console.error("MIDI Init Failed", e);
      return false;
    }
  }

  private handleMessage(e: any) {
    this.listeners.forEach(cb => cb(e));
  }

  subscribe(callback: (e: any) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  getDevices(): MidiDevice[] {
    if (!this.access) return [];
    const devices: MidiDevice[] = [];
    // @ts-ignore
    this.access.inputs.forEach((i) => devices.push({ id: i.id, name: i.name || 'Unknown', state: i.state }));
    return devices;
  }
}
