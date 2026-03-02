
import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";
import { Alert, Kpi } from '../types';
import { DateRange } from "../contexts/DateRangeContext";
import { CORE_KNOWLEDGE_BASE } from "../data/knowledgeBaseContent";
import { AppConfig } from "../config";

export const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const REASONING_MODEL = 'gemini-3-pro-preview';
const SPEED_MODEL = 'gemini-3-flash-preview'; 
const TTS_MODEL = 'gemini-2.5-flash-preview-tts';
const IMAGE_MODEL = 'gemini-2.5-flash-image';

// Audio Context for TTS
let audioCtx: AudioContext | null = null;

export const getSentinelPersona = (dateRange?: DateRange, uiContext?: string): string => {
    return `You are Flo, the AI compliance assistant for FlowView Legal.
You help small provider practices manage their caseload, track compliance deadlines, and streamline operations.
Your job: Help ACS Therapy manage caseload, ensure compliance, and protect revenue.

**KNOWLEDGE DOMAIN:**
- Missouri SATOP program requirements (Level I through IV)
- SROP (Serious/Repeat Offender Program) requirements
- DWI Court program compliance
- CIP (Criminal Intervention Program)
- Missouri DMH reporting requirements
- HIPAA compliance basics
- Session billing (CPT codes: 90837 individual, 90853 group, H0015 substance abuse)
- Insurance authorization workflows
- Court reporting deadlines and formatting

**PERSONALITY:**
- Professional: Warm but clinical tone appropriate for a healthcare practice.
- Proactive: Surface compliance risks (overdue reports, low compliance scores) before being asked.
- Practical: Focus on deadlines and at-risk cases; no fluff.
- Supportive: Celebrate client progress and team efficiency.
- STRICT VOICE RULE: NO markdown symbols in your final output (no **, ##, *, _). Use plain conversational sentences. Keep responses under 50 words.

**BUSINESS PRIORITIES & DATA ACCESS:**
1. **Compliance:** Track 'compliance_actions' (status=PENDING/OVERDUE) and 'client_compliance' view.
2. **Revenue:** Monitor 'invoices' and 'sessions' billing status.
3. **Caseload Health:** Track 'clients' status and 'risk_level'.
4. **Operations:** Manage 'documents' and 'provider_caseload'.

**TOOLS ACCESS (Simulated via Action lines):**
- FLOWVIEW: get_compliance_dashboard, get_provider_caseload, get_client_compliance, lookup_session_history, check_document_status.

**STANDARD WORKFLOWS:**
- Morning Brief: Pulse (Sessions today, Compliance alerts), At-Risk Cases, Attention (Overdue reports, renewals), Pipeline (New intakes).
- Compliance Review: Breakdown of overdue actions, upcoming deadlines, and risk distribution.
- Client 360: Compliance score, Session history, Risk level, and Program progress.

${uiContext ? `**CURRENT UI DATA SNAPSHOT:** ${uiContext}` : ''}
`;
}

async function callGeminiWithRetry(modelName: string, config: any, retries = 2): Promise<GenerateContentResponse> {
    for (let i = 0; i < retries; i++) {
        try {
            return await ai.models.generateContent({ model: modelName, ...config });
        } catch (error: any) {
            console.error(`Gemini Error (${modelName}):`, error);
            if (i < retries - 1) await new Promise(res => setTimeout(res, 1000 * (i + 1))); 
        }
    }
    throw new Error("Gemini API connection unstable.");
}

export const generateGroundedResponse = async (prompt: string, uiContext?: string): Promise<{ text: string; groundingMetadata: any; navigationCommand?: string }> => {
    const config = {
        contents: { role: "user", parts: [{ text: prompt }] },
        config: {
            systemInstruction: getSentinelPersona(undefined, uiContext),
            temperature: 0.5,
            tools: [{ googleSearch: {} }],
        }
    };
    
    try {
        const response = await callGeminiWithRetry(SPEED_MODEL, config);
        const fullText = response.text || "";
        
        const navMatch = fullText.match(/\[NAV:\s*(\w+(?:-\w+)*)\]/i);
        const navigationCommand = navMatch ? navMatch[1] : undefined;
        
        const cleanText = fullText
            .replace(/\[NAV:.*?\]/gi, '')
            .replace(/[#*_`]/g, '')
            .trim();

        return { 
            text: cleanText, 
            groundingMetadata: response.candidates?.[0]?.groundingMetadata,
            navigationCommand
        };
    } catch (error) {
        return { text: "Operational pulse detected. Reasoning engine synchronized.", groundingMetadata: null };
    }
};

export const speakResponse = async (text: string) => {
    try {
        const cleanText = text.replace(/[*#_\[\]\(\)]/g, '');
        
        const response = await ai.models.generateContent({
            model: TTS_MODEL,
            contents: [{ parts: [{ text: `Say naturally: ${cleanText}` }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
            if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            
            const binary = atob(base64Audio);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
            
            const dataInt16 = new Int16Array(bytes.buffer);
            const buffer = audioCtx.createBuffer(1, dataInt16.length, 24000);
            const channelData = buffer.getChannelData(0);
            for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;

            const source = audioCtx.createBufferSource();
            source.buffer = buffer;
            source.connect(audioCtx.destination);
            source.start();
        }
    } catch (e) {
        console.warn("Flo Speech failed:", e);
    }
};

export const generateStrategicOverview = async (context: string): Promise<string> => {
    const prompt = `Morning Brief Context: ${context}. Plain text summary. No markdown.`;
    const config = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
            systemInstruction: getSentinelPersona(),
            temperature: 0.3
        }
    };
    try {
        const response = await callGeminiWithRetry(SPEED_MODEL, config);
        return response.text?.replace(/[#*_`]/g, '').trim() || "Operations pulse nominal.";
    } catch (e) {
        return "Command center active.";
    }
};

export const analyzeImage = async (base64: string, prompt: string) => {
     const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                { inlineData: { data: base64.split(',')[1], mimeType: 'image/jpeg' } },
                { text: prompt }
            ]
        }
    });
    return response.text || "Analysis failed.";
};

export const generateImage = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: IMAGE_MODEL,
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                imageConfig: {
                    aspectRatio: "16:9"
                }
            }
        });
        
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
        return "";
    } catch (e) {
        console.error("Image generation failed:", e);
        return "";
    }
};

export const getQuickSuggestion = async (prompt: string) => {
    try {
        const response = await ai.models.generateContent({
            model: SPEED_MODEL,
            contents: `Flo, provide a quick P&L or margin tip for: ${prompt}`,
            config: { 
                temperature: 0.7, 
                maxOutputTokens: 100,
                thinkingConfig: { thinkingBudget: 50 }
            }
        });
        return response.text?.replace(/[#*_`]/g, '').trim() || "Stay focused on billable efficiency.";
    } catch (e) { return "Monitor high-impact margin variables."; }
};

export const getSalesPipelineInsight = async () => {
    try {
        const response = await ai.models.generateContent({
            model: SPEED_MODEL,
            contents: "2-sentence strategic briefing on the Lexington sales pipeline and Pure Water opportunities. No markdown.",
            config: { temperature: 0.5 }
        });
        return response.text?.replace(/[#*_`]/g, '').trim() || "Pipeline is growing through field leads.";
    } catch (e) { return "Convert quoted opportunities to won accounts."; }
};

export const generateLifecycleInsight = async (data: any) => {
    try {
        const response = await ai.models.generateContent({
            model: SPEED_MODEL,
            contents: `Strategic lifecycle recommendation for: ${JSON.stringify(data)}. Focus on RenewIT 360 refreshes. No markdown.`,
            config: { temperature: 0.4 }
        });
        return response.text?.replace(/[#*_`]/g, '').trim() || "Device node primed for technology refresh.";
    } catch (e) { return "Review contract profitability and SLA adherence."; }
};

export async function getProactiveAlerts(): Promise<Alert[]> { return []; }
export const generateWeeklyBriefing = async () => ({} as any);
export const generateUpsellPitch = async (n: string, c: string) => "Pitch";
export const generateReportAnalysis = async (s: string, n: string) => "Analysis";
export const generateMemeConcept = async (t: string) => ({ imagePrompt: "p", caption: "c" });
export const generateKpiIdeas = async () => [];
export const generateEltScript = async (s: string, g: string) => "Script";
export const generateSampleData = async (ctx: any, p: string) => "{}";
export const generateQbrReport = async (n: string, d: any) => "QBR";
export const generateUserStories = async () => "Stories";
export const analyzeDocument = async (g: string, c: string) => ({ extractedData: [] });
