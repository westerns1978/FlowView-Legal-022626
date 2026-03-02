
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { AppConfig } from "../config";
import { CORE_KNOWLEDGE_BASE } from "../data/knowledgeBaseContent";

/* FIX: Updated model name to gemini-2.5-flash-native-audio-preview-12-2025 per GenAI guidelines for real-time audio tasks */
const MODEL_NAME = 'gemini-2.5-flash-native-audio-preview-12-2025';

class LiveGeminiService {
    private ai: GoogleGenAI;
    private inputAudioContext: AudioContext | null = null;
    private outputAudioContext: AudioContext | null = null;
    private inputSource: MediaStreamAudioSourceNode | null = null;
    private processor: ScriptProcessorNode | null = null;
    private outputNode: GainNode | null = null;
    private nextStartTime: number = 0;
    private sessionPromise: Promise<any> | null = null;
    private isConnected: boolean = false;
    private activeSources: Set<AudioBufferSourceNode> = new Set();

    constructor() {
        this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }

    public async connect(
        onAudioData: (analyser: AnalyserNode) => void,
        onClose: () => void
    ) {
        this.forceDisconnect();

        try {
            this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            this.outputNode = this.outputAudioContext.createGain();
            this.outputNode.connect(this.outputAudioContext.destination);
            
            const analyser = this.outputAudioContext.createAnalyser();
            this.outputNode.connect(analyser);
            onAudioData(analyser);

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            const config = {
                model: MODEL_NAME,
                callbacks: {
                    onopen: this.onOpen.bind(this, stream),
                    onmessage: this.onMessage.bind(this),
                    onclose: () => {
                        this.cleanup();
                        onClose();
                    },
                    onerror: (e: any) => {
                        console.error("Gemini Live Error:", e);
                        this.cleanup();
                        onClose();
                    }
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    systemInstruction: `${AppConfig.roleDefinition} \n\n**VISUAL AUDIT PROTOCOL:**\nIf the technician activates the visual sensor, look for specific hardware anomalies, document integrity risks, or mismatched serial numbers. Frame findings through business impact.\n\nCONTEXT:\n${CORE_KNOWLEDGE_BASE}`,
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
                    },
                }
            };

            this.sessionPromise = this.ai.live.connect(config);
            await this.sessionPromise;
            this.isConnected = true;

        } catch (error) {
            console.error("Failed to connect to Gemini Live:", error);
            this.cleanup();
            onClose();
        }
    }

    public disconnect() {
        if (this.sessionPromise) {
             this.cleanup();
        }
    }

    public forceDisconnect() {
        this.cleanup();
    }

    public sendImage(base64Image: string) {
        if (!this.sessionPromise) return;
        
        const rawBase64 = base64Image.split(',')[1];
        
        this.sessionPromise.then((session) => {
            session.sendRealtimeInput({
                media: {
                    mimeType: 'image/jpeg',
                    data: rawBase64
                }
            });
        });
        console.debug("Visual Frame Ingested to Flo...");
    }

    private onOpen(stream: MediaStream) {
        console.log("Flo Live Session: Synchronized");
        if (!this.inputAudioContext) return;

        this.inputSource = this.inputAudioContext.createMediaStreamSource(stream);
        this.processor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);
        
        this.processor.onaudioprocess = (audioProcessingEvent) => {
            if (!this.sessionPromise) return;
            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
            const pcmBlob = this.createBlob(inputData);
            this.sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
            });
        };

        this.inputSource.connect(this.processor);
        this.processor.connect(this.inputAudioContext.destination);
    }

    private async onMessage(message: LiveServerMessage) {
        const audioString = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
        if (audioString && this.outputAudioContext && this.outputNode) {
            const audioData = this.decode(audioString);
            this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext.currentTime);
            
            const audioBuffer = await this.decodeAudioData(audioData, this.outputAudioContext, 24000, 1);
            
            const source = this.outputAudioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(this.outputNode);
            
            source.addEventListener('ended', () => {
                this.activeSources.delete(source);
            });
            this.activeSources.add(source);

            source.start(this.nextStartTime);
            this.nextStartTime += audioBuffer.duration;
        }
        
        const interrupted = message.serverContent?.interrupted;
        if (interrupted) {
            for (const source of this.activeSources.values()) {
                try {
                    source.stop();
                } catch (e) {}
            }
            this.activeSources.clear();
            this.nextStartTime = 0;
        }
    }

    private cleanup() {
        this.isConnected = false;
        try {
            if (this.sessionPromise) {
                this.sessionPromise.then(session => {
                    try { session.close(); } catch (e) {}
                });
                this.sessionPromise = null;
            }
            if (this.inputSource) {
                this.inputSource.disconnect();
                this.inputSource = null;
            }
            if (this.processor) {
                this.processor.disconnect();
                this.processor = null;
            }
            if (this.inputAudioContext && this.inputAudioContext.state !== 'closed') {
                this.inputAudioContext.close();
            }
            this.inputAudioContext = null;

            if (this.outputAudioContext && this.outputAudioContext.state !== 'closed') {
                this.outputAudioContext.close();
            }
            this.outputAudioContext = null;
            this.outputNode = null;
            
            for (const source of this.activeSources.values()) {
                try { source.stop(); } catch (e) {}
            }
            this.activeSources.clear();
        } catch (e) {
            console.error("Error during cleanup:", e);
        }
    }

    private createBlob(data: Float32Array): { data: string, mimeType: string } {
        const l = data.length;
        const int16 = new Int16Array(l);
        for (let i = 0; i < l; i++) {
            int16[i] = data[i] * 32768;
        }
        const uint8 = new Uint8Array(int16.buffer);
        const base64 = this.encode(uint8);
        return {
            data: base64,
            mimeType: 'audio/pcm;rate=16000',
        };
    }

    private encode(bytes: Uint8Array): string {
        let binary = '';
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    private decode(base64: string): Uint8Array {
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }

    private async decodeAudioData(
        data: Uint8Array,
        ctx: AudioContext,
        sampleRate: number,
        numChannels: number
    ): Promise<AudioBuffer> {
        const dataInt16 = new Int16Array(data.buffer);
        const frameCount = dataInt16.length / numChannels;
        const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

        for (let channel = 0; channel < numChannels; channel++) {
            const channelData = buffer.getChannelData(channel);
            for (let i = 0; i < frameCount; i++) {
                channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
            }
        }
        return buffer;
    }
}

export const liveGemini = new LiveGeminiService();
