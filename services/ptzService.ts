
import { PTZConfig, PTZProtocol } from '../types';
import { NativeBridge } from './nativeBridge';

/**
 * PTZ Service Abstraction
 * Switches between Native Bridge (Android) and Web Simulation.
 */

export interface IPTZController {
  connect(config: PTZConfig): Promise<boolean>;
  move(panSpeed: number, tiltSpeed: number): void;
  zoom(speed: number): void;
  recallPreset(id: string): void;
  savePreset(id: string): void;
  stop(): void;
}

class SimulatorController implements IPTZController {
  async connect(config: PTZConfig) {
    console.log(`[PTZ SIM] Connected to ${config.ip}`);
    return true;
  }
  move(p: number, t: number) {
    if(p !== 0 || t !== 0) console.log(`[PTZ SIM] Moving Pan:${p.toFixed(2)} Tilt:${t.toFixed(2)}`);
  }
  zoom(s: number) {
    if(s !== 0) console.log(`[PTZ SIM] Zooming ${s.toFixed(2)}`);
  }
  recallPreset(id: string) {
    console.log(`[PTZ SIM] Recall Preset ${id}`);
  }
  savePreset(id: string) {
    console.log(`[PTZ SIM] Save Preset ${id}`);
  }
  stop() {
    console.log(`[PTZ SIM] Stop`);
  }
}

class ViscaIPController implements IPTZController {
  private config: PTZConfig | null = null;

  async connect(config: PTZConfig) {
      this.config = config;
      // Simple handshake simulation or ping
      await NativeBridge.sendVisca(config.ip || '', config.port || 52381, '81010001'); // Clear IF
      return true;
  }

  // VISCA Packet Generation
  move(p: number, t: number) {
      if (!this.config?.ip) return;
      
      // Map -1..1 float to 01..18 (hex speed)
      const pSpeed = Math.floor(Math.abs(p) * 0x18).toString(16).padStart(2, '0');
      const tSpeed = Math.floor(Math.abs(t) * 0x18).toString(16).padStart(2, '0');
      
      let dir = '0303'; // Stop
      if (p > 0 && Math.abs(t) < 0.1) dir = '0203'; // Right
      if (p < 0 && Math.abs(t) < 0.1) dir = '0103'; // Left
      if (Math.abs(p) < 0.1 && t > 0) dir = '0301'; // Up
      if (Math.abs(p) < 0.1 && t < 0) dir = '0302'; // Down
      
      // Diagonal handling
      if (p > 0.1 && t > 0.1) dir = '0201'; // Up Right
      if (p < -0.1 && t > 0.1) dir = '0101'; // Up Left
      if (p > 0.1 && t < -0.1) dir = '0202'; // Down Right
      if (p < -0.1 && t < -0.1) dir = '0102'; // Down Left

      const cmd = `81010601${pSpeed}${tSpeed}${dir}FF`;
      NativeBridge.sendVisca(this.config.ip, this.config.port || 52381, cmd);
  }

  zoom(s: number) {
      if (!this.config?.ip) return;
      // 20 = Tele (Zoom In), 30 = Wide (Zoom Out), 00 = Stop
      const dir = s > 0 ? '2' : s < 0 ? '3' : '0';
      // Speed 0-7
      const speed = Math.min(7, Math.floor(Math.abs(s) * 7));
      const cmd = `81010407${dir}${speed}FF`;
      NativeBridge.sendVisca(this.config.ip, this.config.port || 52381, cmd);
  }

  recallPreset(id: string) {
      if (!this.config?.ip) return;
      const hexId = parseInt(id).toString(16).padStart(2, '0');
      const cmd = `8101043F02${hexId}FF`; // Recall
      NativeBridge.sendVisca(this.config.ip, this.config.port || 52381, cmd);
  }

  savePreset(id: string) {
      if (!this.config?.ip) return;
      const hexId = parseInt(id).toString(16).padStart(2, '0');
      const cmd = `8101043F01${hexId}FF`; // Set
      NativeBridge.sendVisca(this.config.ip, this.config.port || 52381, cmd);
  }

  stop() {
      if (!this.config?.ip) return;
      const cmd = `8101060100000303FF`; // Pan/Tilt Stop
      NativeBridge.sendVisca(this.config.ip, this.config.port || 52381, cmd);
  }
}

class OnvifController implements IPTZController {
    private config: PTZConfig | null = null;

    async connect(config: PTZConfig) {
        this.config = config;
        // In real world, we would authenticate and get Profile Token here.
        // For bridge, we pass creds with every command.
        console.log(`[ONVIF] Initialized controller for ${config.ip}`);
        return true;
    }

    move(p: number, t: number) {
        if (!this.config?.ip) return;
        // Native bridge takes x, y, zoom normalized floats
        NativeBridge.moveOnvif(this.config.ip, p, t, 0, this.config.username, this.config.password);
    }

    zoom(s: number) {
        if (!this.config?.ip) return;
        NativeBridge.moveOnvif(this.config.ip, 0, 0, s, this.config.username, this.config.password);
    }

    recallPreset(id: string) {
        if (!this.config?.ip) return;
        NativeBridge.presetOnvif(this.config.ip, 'GOTO', id, this.config.username, this.config.password);
    }

    savePreset(id: string) {
        if (!this.config?.ip) return;
        NativeBridge.presetOnvif(this.config.ip, 'SET', id, this.config.username, this.config.password);
    }

    stop() {
        if (!this.config?.ip) return;
        NativeBridge.moveOnvif(this.config.ip, 0, 0, 0, this.config.username, this.config.password);
    }
}

export const getPTZController = (protocol: PTZProtocol): IPTZController => {
  switch (protocol) {
    case PTZProtocol.VISCA_IP:
      return new ViscaIPController();
    case PTZProtocol.ONVIF:
      return new OnvifController();
    case PTZProtocol.SIMULATOR:
    default:
      return new SimulatorController();
  }
};
