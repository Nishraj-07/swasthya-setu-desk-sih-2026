/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Natural Human Voice Synthesis Engine for SwasthyaSetuDesk & VaniYantra AI
 * Provides ultra-realistic human doctor speech with neural voice prioritization,
 * regional Indian language prosody calibration, punctuation cadence, and empathetic tone.
 */

export interface SpeechOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voiceName?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
  onBoundary?: (charIndex: number) => void;
}

// Preferred high-quality neural & natural voice names across major platforms (Chrome, Edge, Safari, Android, iOS)
const HIGH_QUALITY_VOICE_KEYWORDS = [
  'natural',
  'neural',
  'online',
  'google',
  'microsoft',
  'apple',
  'premium',
  'enhanced',
  'siri',
  'wavenet',
  'deepmind',
  'swara',
  'madhur',
  'lekha',
  'rishi',
  'heera',
  'mohan',
  'shruti',
  'bashkar',
  'kalliope',
];

class NaturalSpeechEngine {
  private synth: SpeechSynthesis | null = null;
  private isSpeaking: boolean = false;
  private voiceCache: SpeechSynthesisVoice[] = [];
  private activeUtterance: SpeechSynthesisUtterance | null = null;
  private resumeInterval: any = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();

      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => {
          this.loadVoices();
        };
      }
    }
  }

  private loadVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    try {
      this.voiceCache = this.synth.getVoices();
    } catch (e) {
      console.warn('Voice loading warning:', e);
    }
    return this.voiceCache;
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.voiceCache || this.voiceCache.length === 0) {
      return this.loadVoices();
    }
    return this.voiceCache;
  }

  /**
   * Find the best natural human sounding voice for a given language code
   */
  public findBestVoice(langCode: string, speechCode?: string): SpeechSynthesisVoice | null {
    const voices = this.getAvailableVoices();
    if (!voices || voices.length === 0) return null;

    const targetSpeechCode = (speechCode || `${langCode}-IN`).toLowerCase();
    const baseLang = langCode.toLowerCase();

    // 1. Check for high-quality / neural voice with exact speech code (e.g. "hi-IN", "ta-IN", "te-IN")
    const neuralMatch = voices.find((v) => {
      const vLang = v.lang.toLowerCase();
      const vName = v.name.toLowerCase();
      const isLangMatch = vLang === targetSpeechCode || vLang.replace('_', '-') === targetSpeechCode;
      const isHighQuality = HIGH_QUALITY_VOICE_KEYWORDS.some((kw) => vName.includes(kw));
      return isLangMatch && isHighQuality;
    });
    if (neuralMatch) return neuralMatch;

    // 2. Check for exact speech code match
    const exactMatch = voices.find((v) => {
      const vLang = v.lang.toLowerCase().replace('_', '-');
      return vLang === targetSpeechCode || vLang.startsWith(targetSpeechCode);
    });
    if (exactMatch) return exactMatch;

    // 3. Check for neural / natural voice with base language (e.g. "hi", "ta", "mr", "bn")
    const baseNeuralMatch = voices.find((v) => {
      const vLang = v.lang.toLowerCase();
      const vName = v.name.toLowerCase();
      const isBaseMatch = vLang.startsWith(baseLang);
      const isHighQuality = HIGH_QUALITY_VOICE_KEYWORDS.some((kw) => vName.includes(kw));
      return isBaseMatch && isHighQuality;
    });
    if (baseNeuralMatch) return baseNeuralMatch;

    // 4. Check for any voice starting with base language
    const baseMatch = voices.find((v) => v.lang.toLowerCase().startsWith(baseLang));
    if (baseMatch) return baseMatch;

    // 5. Fallback for Indian English or Indian regional voice
    const indianVoice = voices.find((v) => {
      const vLang = v.lang.toLowerCase();
      const vName = v.name.toLowerCase();
      return (
        vLang.includes('-in') ||
        vLang.includes('_in') ||
        vName.includes('india') ||
        vName.includes('hindi')
      );
    });
    if (indianVoice) return indianVoice;

    // 6. Default voice
    return voices.find((v) => v.default) || voices[0] || null;
  }

  /**
   * Preprocess text for natural human conversational delivery:
   * - Cleans markdown & symbols
   * - Expands medical abbreviations naturally
   * - Inserts human breath pauses at Indic punctuation marks (। , ?)
   */
  public cleanTextForHumanSpeech(text: string, langCode: string): string {
    if (!text) return '';

    let cleaned = text
      // Remove Markdown asterisks, hashtags, backticks, brackets
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/#{1,6}\s+/g, '')
      .replace(/`{1,3}(.*?)`{1,3}/g, '$1')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/[\(\)\[\]\{\}]/g, ', ')
      // Clean bullet points
      .replace(/^\s*[-*•]\s+/gm, '')
      // Remove HTML tags
      .replace(/<[^>]*>/g, '')
      // Clean excessive whitespace
      .replace(/\s+/g, ' ')
      .trim();

    // Natural expansion of common medical terms for smooth pronunciation
    cleaned = cleaned
      .replace(/\bDr\.\s*/gi, 'Doctor ')
      .replace(/\bPt\.\s*/gi, 'Patient ')
      .replace(/\bECG\b/gi, 'E C G ')
      .replace(/\bBP\b/gi, 'Blood Pressure ')
      .replace(/\bHR\b/gi, 'Heart Rate ')
      .replace(/\bSpO2\b/gi, 'Oxygen Level ')
      .replace(/\bmg\b/gi, ' milligrams ')
      .replace(/\bmin\b/gi, ' minutes ')
      .replace(/\bhrs?\b/gi, ' hours ')
      .replace(/\bsec\b/gi, ' seconds ');

    // Add breathing micro-pauses at Indic danda ('।') and colons
    cleaned = cleaned
      .replace(/।/g, '। ')
      .replace(/॥/g, '॥ ')
      .replace(/:\s*/g, ' — ')
      .replace(/;\s*/g, ', ')
      .replace(/\.{2,}/g, '... ');

    return cleaned;
  }

  /**
   * Speak text with ultra-realistic human cadence and empathetic doctor tone
   */
  public speak(
    text: string,
    langCode: string,
    speechCode?: string,
    options: SpeechOptions = {}
  ): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synth || typeof window === 'undefined') {
        if (options.onEnd) options.onEnd();
        resolve();
        return;
      }

      this.stop();

      const cleanedText = this.cleanTextForHumanSpeech(text, langCode);
      if (!cleanedText) {
        if (options.onEnd) options.onEnd();
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(cleanedText);
      this.activeUtterance = utterance;

      // Select Best Natural Voice
      let selectedVoice: SpeechSynthesisVoice | null = null;
      if (options.voiceName) {
        const voices = this.getAvailableVoices();
        selectedVoice = voices.find((v) => v.name === options.voiceName) || null;
      }
      if (!selectedVoice) {
        selectedVoice = this.findBestVoice(langCode, speechCode);
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;
      } else {
        utterance.lang = speechCode || `${langCode}-IN`;
      }

      // Empathetic, warm doctor speaking rate & pitch
      // Standard human speaking cadence is between 0.90x to 0.95x for clear, reassuring comprehension
      utterance.rate = options.rate !== undefined ? options.rate : 0.92;
      utterance.pitch = options.pitch !== undefined ? options.pitch : 1.0;
      utterance.volume = options.volume !== undefined ? options.volume : 1.0;

      utterance.onstart = () => {
        this.isSpeaking = true;
        if (options.onStart) options.onStart();

        // Chrome SpeechSynthesis bugfix: prevent audio garbage collection cutoff for long sentences
        this.startKeepAlive();
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        this.stopKeepAlive();
        this.activeUtterance = null;
        if (options.onEnd) options.onEnd();
        resolve();
      };

      utterance.onerror = (err) => {
        console.warn('Natural speech synthesis event:', err);
        this.isSpeaking = false;
        this.stopKeepAlive();
        this.activeUtterance = null;
        if (options.onError) options.onError(err);
        if (options.onEnd) options.onEnd();
        resolve();
      };

      if (options.onBoundary) {
        utterance.onboundary = (e) => {
          options.onBoundary?.(e.charIndex);
        };
      }

      try {
        this.synth.speak(utterance);
      } catch (err) {
        console.warn('SpeechSynthesis speak failed:', err);
        this.isSpeaking = false;
        this.stopKeepAlive();
        if (options.onEnd) options.onEnd();
        resolve();
      }
    });
  }

  /**
   * Stop any current playback
   */
  public stop() {
    this.stopKeepAlive();
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {}
    }
    this.isSpeaking = false;
    this.activeUtterance = null;
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking || (this.synth ? this.synth.speaking : false);
  }

  private startKeepAlive() {
    this.stopKeepAlive();
    // Periodically pause and resume to prevent browser synthesis timeout
    this.resumeInterval = setInterval(() => {
      if (this.synth && this.synth.speaking) {
        this.synth.pause();
        this.synth.resume();
      } else {
        this.stopKeepAlive();
      }
    }, 9000);
  }

  private stopKeepAlive() {
    if (this.resumeInterval) {
      clearInterval(this.resumeInterval);
      this.resumeInterval = null;
    }
  }
}

export const naturalSpeech = new NaturalSpeechEngine();
