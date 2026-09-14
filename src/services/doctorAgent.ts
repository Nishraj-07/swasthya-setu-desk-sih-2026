import { GoogleGenAI, Type } from '@google/genai';

export interface ChatMessage {
  role: 'user' | 'model' | 'assistant';
  content: string;
}

export interface SocratesData {
  site?: string;
  onset?: string;
  character?: string;
  radiation?: string;
  associatedSymptoms?: string[];
  timeCourse?: string;
  exacerbatingFactors?: string;
  severity?: string | number;
  [key: string]: any;
}

/**
 * 1. Doctor Agent: Speaks naturally with the patient
 * Dr. Vaani - warm, professional, and empathetic clinical intake doctor.
 * 
 * Bedside Communication Rules:
 * - Empathetic Acknowledgment: Always validate what the patient just shared before asking the next question (e.g., "I see, a mild stomach ache can still be uncomfortable.").
 * - One Question at a Time: Never interrogate the patient with a list of medical queries. Ask exactly ONE simple, clear follow-up question per turn to understand missing clinical context (e.g., "How many days has this been going on?" or "Is the pain sharper in one specific area, like near your belly button or lower abdomen?").
 * - Concise & Natural: Keep spoken responses under 2 sentences so it feels like a real, flowing voice conversation.
 * - No Jargon: Use simple everyday language. Never mention clinical frameworks like "SOCRATES" to the patient.
 */
export const runDoctorTurn = async (
  chatHistory: { role: string; content: string }[],
  latestInput: string,
  languageCode: string = 'en'
): Promise<string> => {
  try {
    const res = await fetch('/api/vaniyantra/doctor-turn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatHistory,
        latestInput,
        languageCode,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.reply) return data.reply;
    }
  } catch (err) {
    console.warn('Backend doctor turn API notice, trying direct fallback:', err);
  }

  // Fallback direct Gemini call if backend route is unavailable
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const doctorPrompt = `
You are Dr. Vaani, a warm, professional, and empathetic clinical intake doctor. Speak naturally with the patient just like a real doctor would in an outpatient clinic.

CRITICAL CLINICAL ACCURACY RULE:
If a SOCRATES parameter (e.g., Site, Duration, Radiation, Character, Onset, Associations, Exacerbating factors, Severity) is not explicitly stated by the user, set its value strictly to 'Unspecified' and trigger a follow-up clarification question instead of inferring it.
Never guess or impute unmentioned parameters from words like "regular" or "minor".

Follow these bedside communication rules:
- Empathetic Acknowledgment: Always validate what the patient just shared before asking the next question (e.g., "I see, a mild stomach ache can still be uncomfortable.").
- One Question at a Time: Never interrogate the patient with a list of medical queries. Ask exactly ONE simple, clear follow-up question per turn to clarify the highest-priority missing clinical parameter (e.g., "How many days has this been going on?" or "Is the pain sharper in one specific area, like near your belly button or lower abdomen?").
- Concise & Natural: Keep your spoken responses under 2 sentences so it feels like a real, flowing voice conversation.
- No Jargon: Use simple everyday language. Never mention clinical frameworks like "SOCRATES" to the patient.
`;

      const contents = [
        { role: 'user', parts: [{ text: doctorPrompt }] },
        ...chatHistory.map((msg) => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        })),
        { role: 'user', parts: [{ text: latestInput }] },
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
      });

      if (response.text) {
        return response.text.trim();
      }
    } catch (e) {
      console.warn('Client-side Gemini doctor turn notice:', e);
    }
  }

  // Graceful rule-based empathetic fallback
  if (latestInput.toLowerCase().includes('stomach') || latestInput.toLowerCase().includes('belly') || latestInput.toLowerCase().includes('पेट')) {
    return 'I see, a stomach ache can certainly be uncomfortable. How many days has this been going on?';
  }
  if (latestInput.toLowerCase().includes('chest') || latestInput.toLowerCase().includes('heart') || latestInput.toLowerCase().includes('सीने')) {
    return 'I understand, chest discomfort can feel very distressing. Does the pain feel sharper in one specific spot, or is it a heavy pressure?';
  }

  return 'I understand how concerning these symptoms must be. Could you tell me when this first started?';
};

/**
 * 2. Extractor Agent: Runs silently in the background to update the clinical dashboard
 * Extracts SOCRATES clinical parameters from patient-doctor conversation transcript.
 * Only extracts explicitly confirmed facts. Sets unmentioned fields strictly to "Unspecified".
 */
export const extractSocratesData = async (fullTranscript: string): Promise<SocratesData> => {
  try {
    const res = await fetch('/api/vaniyantra/extract-socrates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullTranscript }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.socrates) return data.socrates;
    }
  } catch (err) {
    console.warn('Backend SOCRATES extractor API notice:', err);
  }

  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const extractorPrompt = `
Extract SOCRATES clinical parameters from this patient-doctor conversation transcript.

CRITICAL CLINICAL ACCURACY RULE:
If a SOCRATES parameter (e.g., Site, Duration, Radiation, Character, Onset, Associations, Exacerbating factors, Severity) is not explicitly stated by the user, set its value strictly to 'Unspecified' and trigger a follow-up clarification question instead of inferring it.
Never assume or extrapolate clinical details (such as pain radiation, location, duration, or severity) based on classic medical presentations or words like "minor" or "regular". If the patient mentions stomach pain but does not state radiation or duration, you MUST set radiation and duration strictly to "Unspecified". Do not hallucinate textbook symptoms or impute missing slots.

Transcript:
${fullTranscript}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: extractorPrompt }] }],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              socrates: {
                type: Type.OBJECT,
                properties: {
                  site: { type: Type.STRING },
                  onset: { type: Type.STRING },
                  character: { type: Type.STRING },
                  radiation: { type: Type.STRING },
                  associatedSymptoms: { type: Type.ARRAY, items: { type: Type.STRING } },
                  timeCourse: { type: Type.STRING },
                  exacerbatingFactors: { type: Type.STRING },
                  severity: { type: Type.STRING },
                },
              },
              clarification_needed: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return parsed.socrates || {};
    } catch (e) {
      console.warn('Client-side SOCRATES extractor notice:', e);
    }
  }

  return {
    site: 'Unspecified',
    onset: 'Unspecified',
    character: 'Unspecified',
    radiation: 'None reported',
    associatedSymptoms: [],
    timeCourse: 'Unspecified',
    exacerbatingFactors: 'Unspecified',
    severity: 'Unspecified',
  };
};
