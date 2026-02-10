
/**
 * ARCLS Native Bridge (V8.1)
 * Connects React Logic to Kotlin Plugins
 */
const isNative = typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform();

export const NativeBridge = {
    isNative,

    // --- VISCA PTZ ---
    async sendVisca(ip: string, port: number, hexCmd: string) {
        if (!isNative) {
            console.log(`[SIMULATION] VISCA -> ${ip}:${port} [${hexCmd}]`);
            return;
        }
        // @ts-ignore
        await window.Capacitor.Plugins.ArclsNative.sendVisca({ ip, port, cmd: hexCmd });
    },

    // --- ONVIF ---
    async discoverOnvif() {
        if (!isNative) {
            return [{ ip: '192.168.1.10', name: 'Simulated ONVIF Cam' }];
        }
        // @ts-ignore
        const res = await window.Capacitor.Plugins.ArclsNative.discoverOnvif();
        return res.devices || [];
    },

    async moveOnvif(ip: string, x: number, y: number, zoom: number, username?: string, password?: string) {
        if (!isNative) {
            console.log(`[SIMULATION] ONVIF Move -> ${ip} [x:${x.toFixed(2)}, y:${y.toFixed(2)}, z:${zoom.toFixed(2)}]`);
            return;
        }
        // @ts-ignore
        await window.Capacitor.Plugins.ArclsNative.moveOnvif({ ip, x, y, zoom, username, password });
    },

    async presetOnvif(ip: string, command: 'SET' | 'GOTO', presetId: string, username?: string, password?: string) {
        if (!isNative) {
            console.log(`[SIMULATION] ONVIF Preset ${command} -> ID:${presetId}`);
            return;
        }
        // @ts-ignore
        await window.Capacitor.Plugins.ArclsNative.presetOnvif({ ip, command, presetId, username, password });
    },

    // --- RTSP ---
    async playRtsp(url: string, elementId: string) {
        if (!isNative) {
            console.warn("RTSP requires Native Shell. Using Web fallback.");
            return;
        }
        const el = document.getElementById(elementId);
        if (el) {
            const rect = el.getBoundingClientRect();
            // @ts-ignore
            await window.Capacitor.Plugins.ArclsNative.playRtsp({
                url, 
                x: rect.x, y: rect.y, w: rect.width, h: rect.height
            });
        }
    },

    // --- TELEMETRY (NEW V8.1) ---
    async getSystemHealth() {
        if (!isNative) {
            // Web Simulation
            return {
                batteryLevel: 100,
                isCharging: true,
                thermalStatus: 0,
                usedMemoryMB: 512,
                cpuLoad: 15,
                gpuLoad: 20,
                fps: 60,
                droppedFrames: 0,
                networkStatus: 'GOOD'
            };
        }
        // @ts-ignore
        const res = await window.Capacitor.Plugins.ArclsNative.getSystemHealth();
        return res;
    }
};
