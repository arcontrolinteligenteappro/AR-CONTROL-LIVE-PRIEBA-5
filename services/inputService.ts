
import { GamepadState } from '../types';

/**
 * INPUT CONTROL ENGINE
 * Handles polling of physical gamepads/joysticks for Broadcast Control
 * Features: Deadzone correction, visualizer normalization, event mapping
 */
export class InputService {
    private static instance: InputService;
    private gamepads: GamepadState[] = [];
    private listeners: ((pads: GamepadState[]) => void)[] = [];
    private animationFrame: number | null = null;

    private constructor() {
        this.startPolling();
    }

    static getInstance() {
        if (!InputService.instance) {
            InputService.instance = new InputService();
        }
        return InputService.instance;
    }

    private startPolling() {
        const scan = () => {
            const navGamepads = navigator.getGamepads ? navigator.getGamepads() : [];
            const newStates: GamepadState[] = [];

            for (let i = 0; i < navGamepads.length; i++) {
                const gp = navGamepads[i];
                if (gp) {
                    newStates.push({
                        id: gp.id,
                        connected: gp.connected,
                        // Normalize axes (apply small deadzone)
                        axes: gp.axes.map(val => Math.abs(val) < 0.05 ? 0 : val),
                        buttons: gp.buttons.map(b => ({ pressed: b.pressed, value: b.value })),
                        timestamp: gp.timestamp
                    });
                }
            }

            this.gamepads = newStates;
            this.notify();
            this.animationFrame = requestAnimationFrame(scan);
        };
        this.animationFrame = requestAnimationFrame(scan);
    }

    getGamepads() {
        return this.gamepads;
    }

    subscribe(cb: (pads: GamepadState[]) => void) {
        this.listeners.push(cb);
        return () => {
            this.listeners = this.listeners.filter(l => l !== cb);
        };
    }

    private notify() {
        this.listeners.forEach(cb => cb(this.gamepads));
    }
}
