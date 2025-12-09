export class SoundEngine {
    private ctx: AudioContext | null = null;

    constructor() {
        this.ctx = null;
    }

    ensureContext() {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;

        if (!this.ctx) {
            this.ctx = new AudioContext();
        }
        
        if (this.ctx.state === 'suspended') {
            this.ctx.resume().then(() => {
                console.log("Audio Context Resumed");
            });
        }
    }

    playEmergencyBell() {
        this.ensureContext();
        if (!this.ctx) return;
        
        const now = this.ctx.currentTime;
        
        const playTone = (startTime: number, frequency: number, duration: number, type: OscillatorType = 'sine') => {
            if (!this.ctx) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = type; 
            osc.frequency.setValueAtTime(frequency, startTime);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.5, startTime + 0.05); 
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration); 
            
            osc.start(startTime);
            osc.stop(startTime + duration);
        };

        // Nada Ting-Tung-Ting-Tung (Alarm)
        playTone(now, 880, 2.0);        
        playTone(now + 0.8, 659.25, 2.5); 
        playTone(now + 3.5, 880, 2.0);
        playTone(now + 4.3, 659.25, 2.5);
    }

    speak(text: string, voices: SpeechSynthesisVoice[]) {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel(); 
        this.ensureContext();

        const utterance = new SpeechSynthesisUtterance(text);
        const indoVoice = voices.find(
            (voice) => voice.name === 'Google Bahasa Indonesia' || voice.lang === 'id-ID'
        );

        if (indoVoice) {
            utterance.voice = indoVoice;
            utterance.lang = 'id-ID';
        } else {
            utterance.lang = 'id-ID'; 
        }
        
        utterance.rate = 0.95; 
        utterance.pitch = 1.0; 
        utterance.volume = 1.0;
        
        window.speechSynthesis.speak(utterance);
    }
}

export const soundEngine = new SoundEngine();
