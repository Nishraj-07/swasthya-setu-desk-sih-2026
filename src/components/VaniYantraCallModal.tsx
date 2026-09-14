/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Bot,
  User,
  Globe,
  Send,
  CheckCircle2,
  Stethoscope,
  BrainCircuit,
  TestTube2,
  Settings2,
  Sliders,
  Award,
  Activity,
  FileCheck2,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  RefreshCw,
} from 'lucide-react';
import { BhashiniLanguage, ClinicalTrack, SocratesHistory } from '../types';
import {
  getLanguageTriageConfig,
  consultVaniYantraAi,
  processUserSpokenTurn,
  generateFullClinicalReport,
  VaniYantraContextMessage,
  LanguageTriageConfig,
  VaniYantraFullReportResult,
} from '../data/vaniyantraEngine';
import {
  getDoctorResponse,
  extractSocratesParameters,
  Message,
} from '../services/clinicalTriageService';
import { audioSynth } from '../utils/audioSynthesizer';
import { naturalSpeech } from '../utils/naturalSpeechEngine';

interface VaniYantraCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: BhashiniLanguage;
  clinicalTrack: ClinicalTrack;
  onSymptomsExtracted: (text: string, socratesPartial?: Partial<SocratesHistory>) => void;
}

export const VaniYantraCallModal: React.FC<VaniYantraCallModalProps> = ({
  isOpen,
  onClose,
  language,
  clinicalTrack,
  onSymptomsExtracted,
}) => {
  const [callState, setCallState] = useState<'incoming' | 'connected' | 'ended'>('incoming');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [turnCount, setTurnCount] = useState(0);

  // Audio Control Settings
  const [showAudioSettings, setShowAudioSettings] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(0.92);
  const [speechPitch, setSpeechPitch] = useState<number>(1.0);
  const [speechVolume, setSpeechVolume] = useState<number>(1.0);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('');
  const [showBilingualSubtitles, setShowBilingualSubtitles] = useState(true);

  // Dynamic conversation messages
  const [dialogue, setDialogue] = useState<VaniYantraContextMessage[]>([]);
  const [customInputText, setCustomInputText] = useState('');
  const [interimSpeechText, setInterimSpeechText] = useState('');
  const [currentlySpeakingMsgId, setCurrentlySpeakingMsgId] = useState<string | null>(null);

  // Silent clinical state held in memory during the call (NO live diagnostic UI during call!)
  const [extractedSocrates, setExtractedSocrates] = useState<SocratesHistory>({
    site: '',
    onset: '',
    character: '',
    radiation: '',
    associatedSymptoms: [],
    timeCourse: '',
    exacerbatingFactors: '',
    severity: 7,
  });

  // Post-Call Final Clinical Report State (Synthesized ONLY after call finishes)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [finalReport, setFinalReport] = useState<VaniYantraFullReportResult | null>(null);

  // Active Call State Refs to guarantee immediate cancellation and zero background persistence
  const isCallActiveRef = useRef<boolean>(false);
  const callStateRef = useRef<'incoming' | 'connected' | 'ended'>('incoming');
  const timerRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const langConfig: LanguageTriageConfig = getLanguageTriageConfig(language.code);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [dialogue, interimSpeechText, isAiSpeaking, isListening, isAiThinking]);

  // Update call state ref synchronously
  useEffect(() => {
    callStateRef.current = callState;
    isCallActiveRef.current = callState === 'connected';
  }, [callState]);

  // Master Stop Function to immediately terminate all mic, synthesis, ringtones, and background tasks
  const terminateAllAudioAndSpeech = useCallback(() => {
    isCallActiveRef.current = false;
    naturalSpeech.stop();

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (_) {
        try {
          recognitionRef.current.stop();
        } catch (__) {}
      }
    }

    audioSynth.stopIncomingRingtone();
    setIsAiSpeaking(false);
    setIsListening(false);
    setIsAiThinking(false);
    setCurrentlySpeakingMsgId(null);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, []);

  // Voice Discovery and Speech Recognition Initialization
  useEffect(() => {
    const initVoices = () => {
      const voices = naturalSpeech.getAvailableVoices();
      setAvailableVoices(voices);

      const best = naturalSpeech.findBestVoice(language.code, language.speechCode);
      if (best) {
        setSelectedVoiceName(best.name);
      } else if (voices.length > 0) {
        setSelectedVoiceName(voices[0].name);
      }
    };

    initVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = initVoices;
    }

    // Initialize Web Speech Recognition
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recog = new SpeechRecognition();
        recog.continuous = false;
        recog.interimResults = true;
        recog.lang = language.speechCode || `${language.code}-IN`;

        recog.onresult = (event: any) => {
          if (!isCallActiveRef.current) return;

          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setInterimSpeechText(currentTranscript);

          if (event.results[0].isFinal) {
            handleUserMessageSubmit(currentTranscript);
          }
        };

        recog.onerror = (err: any) => {
          console.warn('Speech recognition warning:', err);
          setIsListening(false);
          audioSynth.playMicStopBeep();
        };

        recog.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recog;
      } catch (err) {
        console.warn('SpeechRecognition init failed:', err);
      }
    }

    return () => {
      terminateAllAudioAndSpeech();
    };
  }, [language.code, language.speechCode, terminateAllAudioAndSpeech]);

  // Clean termination when modal is opened or closed
  useEffect(() => {
    if (isOpen) {
      handleAcceptCall();
    } else {
      terminateAllAudioAndSpeech();
      audioSynth.stopIncomingRingtone();
      setCallState('incoming');
      setDialogue([]);
      setFinalReport(null);
    }
    return () => {
      audioSynth.stopIncomingRingtone();
    };
  }, [isOpen, terminateAllAudioAndSpeech]);

  // Call duration timer
  useEffect(() => {
    if (callState === 'connected') {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callState]);

  // Oscilloscope Visualizer Canvas Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const isLive = isAiSpeaking || isListening || isAiThinking;
      const numBars = 32;
      const barWidth = width / numBars;

      for (let i = 0; i < numBars; i++) {
        let barHeight = 4;
        let color = '#334155';

        if (isAiSpeaking) {
          const sinVal = Math.sin(phase + i * 0.32) * 0.5 + 0.5;
          barHeight = Math.max(6, sinVal * (height * 0.82) * (Math.sin(phase * 1.4 + i * 0.15) * 0.3 + 0.7));
          color = i % 2 === 0 ? '#10b981' : '#34d399';
        } else if (isListening) {
          const sinVal = Math.sin(phase * 1.8 + i * 0.45) * 0.5 + 0.5;
          barHeight = Math.max(8, sinVal * (height * 0.85));
          color = i % 2 === 0 ? '#06b6d4' : '#38bdf8';
        } else if (isAiThinking) {
          const sinVal = Math.sin(phase * 2.2 + i * 0.25) * 0.5 + 0.5;
          barHeight = Math.max(6, sinVal * (height * 0.65));
          color = '#f59e0b';
        }

        const x = i * barWidth + barWidth * 0.2;
        const y = (height - barHeight) / 2;

        ctx.fillStyle = color;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, y, barWidth * 0.6, barHeight, 3);
        } else {
          ctx.rect(x, y, barWidth * 0.6, barHeight);
        }
        ctx.fill();
      }

      phase += isLive ? 0.12 : 0.03;
      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isAiSpeaking, isListening, isAiThinking]);

  // High-Fidelity Natural Speech Synthesis Utterance
  const speakAiUtterance = async (text: string, msgId?: string, onEndCallback?: () => void) => {
    if (!isCallActiveRef.current || !isSpeakerOn) {
      if (onEndCallback && isCallActiveRef.current) setTimeout(onEndCallback, 300);
      return;
    }

    setIsAiSpeaking(true);
    if (msgId) setCurrentlySpeakingMsgId(msgId);

    let callbackFired = false;
    const triggerSafeCallback = () => {
      if (!callbackFired) {
        callbackFired = true;
        setIsAiSpeaking(false);
        setCurrentlySpeakingMsgId(null);
        if (isCallActiveRef.current && onEndCallback) {
          onEndCallback();
        }
      }
    };

    // Safety timeout: Ensure microphone or next turn activates even if browser SpeechSynthesis is silent
    const safetyTimer = setTimeout(() => {
      triggerSafeCallback();
    }, 4500);

    try {
      await naturalSpeech.speak(text, language.code, language.speechCode, {
        rate: speechRate,
        pitch: speechPitch,
        volume: speechVolume,
        voiceName: selectedVoiceName || undefined,
        onStart: () => {
          if (!isCallActiveRef.current) {
            naturalSpeech.stop();
            return;
          }
          setIsAiSpeaking(true);
        },
        onEnd: () => {
          clearTimeout(safetyTimer);
          triggerSafeCallback();
        },
        onError: () => {
          clearTimeout(safetyTimer);
          triggerSafeCallback();
        },
      });
    } catch (err) {
      clearTimeout(safetyTimer);
      triggerSafeCallback();
    }
  };

  // Start Voice Call
  const handleAcceptCall = () => {
    audioSynth.stopIncomingRingtone();
    audioSynth.playConnectChime();
    setCallState('connected');
    callStateRef.current = 'connected';
    isCallActiveRef.current = true;
    setCallDuration(0);
    setTurnCount(0);
    setFinalReport(null);

    const greeting = langConfig.initialGreeting;
    const msgId = `ai-greeting-${Date.now()}`;
    const initialMsg: VaniYantraContextMessage = {
      id: msgId,
      sender: 'ai',
      textLocal: greeting.local,
      textEnglish: greeting.english,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    setDialogue([initialMsg]);
    speakAiUtterance(greeting.local, msgId, () => {
      if (isCallActiveRef.current) {
        startMicrophoneListening();
      }
    });
  };

  // Resume Incomplete Call seamlessly
  const handleResumeCall = () => {
    audioSynth.playConnectChime();
    setCallState('connected');
    callStateRef.current = 'connected';
    isCallActiveRef.current = true;
    setFinalReport(null);

    const resumeReplyLocal =
      language.code === 'hi'
        ? 'कॉल फिर से जुड़ गया है। कृपया अपनी तकलीफ के बारे में आगे बताएं।'
        : language.code === 'ta'
        ? 'அழைப்பு மீண்டும் இணைக்கப்பட்டது. தயவுசெய்து உங்கள் அறிகுறிகளை தொடர்ந்து சொல்லுங்கள்.'
        : `Call resumed with Dr. VaniYantra. Please continue describing your symptoms.`;

    const resumeReplyEnglish = 'Call re-connected. Please continue sharing your clinical symptoms.';

    const resumeMsgId = `ai-resume-${Date.now()}`;
    const resumeMsg: VaniYantraContextMessage = {
      id: resumeMsgId,
      sender: 'ai',
      textLocal: resumeReplyLocal,
      textEnglish: resumeReplyEnglish,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    setDialogue((prev) => [...prev, resumeMsg]);
    speakAiUtterance(resumeReplyLocal, resumeMsgId, () => {
      if (isCallActiveRef.current) {
        startMicrophoneListening();
      }
    });
  };

  // Start Mic Listening
  const startMicrophoneListening = () => {
    if (!isCallActiveRef.current || isMuted) return;
    setInterimSpeechText('');

    if (recognitionRef.current) {
      try {
        recognitionRef.current.lang = language.speechCode || `${language.code}-IN`;
        recognitionRef.current.start();
        setIsListening(true);
        audioSynth.playMicStartBeep();
      } catch (err) {
        setIsListening(true);
      }
    } else {
      setIsListening(true);
      audioSynth.playMicStartBeep();
    }
  };

  const stopMicrophoneListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }
    if (isListening) {
      audioSynth.playMicStopBeep();
    }
    setIsListening(false);
  };

  const handleReplaySpeech = (text: string, id: string) => {
    speakAiUtterance(text, id);
  };

  // Submit User Message with Autonomous Fast AI Doctor Thinking
  const handleUserMessageSubmit = async (userText: string, customTranslation?: string) => {
    if (!userText.trim() || !isCallActiveRef.current) return;

    stopMicrophoneListening();
    setInterimSpeechText('');
    setCustomInputText('');

    const userMsg: VaniYantraContextMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      textLocal: userText,
      textEnglish: customTranslation || `Patient intake (${language.name}): "${userText}"`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    const updatedHistory = [...dialogue, userMsg];
    setDialogue(updatedHistory);
    setTurnCount((prev) => prev + 1);

    setIsAiThinking(true);
    audioSynth.playDiagnosticPulse();

    try {
      // Formatted history for shared doctor pipeline
      const historyForDoctor: Message[] = updatedHistory.map((m) => ({
        id: m.id,
        sender: m.sender === 'user' ? 'user' : 'doctor',
        text: m.textEnglish || m.textLocal,
        timestamp: m.timestamp,
      }));

      // 1. Natural Doctor Persona Turn (Fast)
      const doctorReplyText = await getDoctorResponse(null, historyForDoctor, userText);
      
      if (!isCallActiveRef.current) return;

      const aiReplyId = `ai-${Date.now()}`;
      const aiReplyMsg: VaniYantraContextMessage = {
        id: aiReplyId,
        sender: 'ai',
        textLocal: doctorReplyText,
        textEnglish: doctorReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };

      const finalHistory = [...updatedHistory, aiReplyMsg];
      setDialogue(finalHistory);
      setIsAiThinking(false);

      // 2. Speak response
      speakAiUtterance(doctorReplyText, aiReplyId, () => {
        if (isCallActiveRef.current) {
          startMicrophoneListening();
        }
      });

      // 3. Silently update SOCRATES parameters in background
      const historyForExtractor: Message[] = finalHistory.map((m) => ({
        id: m.id,
        sender: m.sender === 'user' ? 'user' : 'doctor',
        text: m.textEnglish || m.textLocal,
        timestamp: m.timestamp,
      }));

      extractSocratesParameters(null, historyForExtractor).then((extractedSocratesData) => {
        const updatedSocrates: SocratesHistory = {
          ...extractedSocrates,
          site: extractedSocratesData.site !== 'Unspecified' ? extractedSocratesData.site : extractedSocrates.site,
          onset: extractedSocratesData.onset !== 'Unspecified' ? extractedSocratesData.onset : extractedSocrates.onset,
          character: extractedSocratesData.character !== 'Unspecified' ? extractedSocratesData.character : extractedSocrates.character,
          radiation: extractedSocratesData.radiation !== 'Unspecified' ? extractedSocratesData.radiation : extractedSocrates.radiation,
          timeCourse: extractedSocratesData.timing_duration !== 'Unspecified' ? extractedSocratesData.timing_duration : extractedSocrates.timeCourse,
          exacerbatingFactors: extractedSocratesData.exacerbating_factors !== 'Unspecified' ? extractedSocratesData.exacerbating_factors : extractedSocrates.exacerbatingFactors,
          severity: extractedSocratesData.severity !== 'Unspecified' ? parseInt(extractedSocratesData.severity) || extractedSocrates.severity : extractedSocrates.severity,
        };
        setExtractedSocrates(updatedSocrates);
        onSymptomsExtracted(userText, updatedSocrates);
      }).catch((err) => console.warn('Background extractor notice in call:', err));

    } catch (err) {
      console.error('Error during AI Doctor consultation:', err);
      if (!isCallActiveRef.current) return;

      setIsAiThinking(false);

      const fallback = processUserSpokenTurn(userText, language.code, turnCount, extractedSocrates);
      const aiReplyId = `ai-${Date.now()}`;
      const aiReplyMsg: VaniYantraContextMessage = {
        id: aiReplyId,
        sender: 'ai',
        textLocal: fallback.aiReplyLocal,
        textEnglish: fallback.aiReplyEnglish,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };
      setDialogue((prev) => [...prev, aiReplyMsg]);
      speakAiUtterance(fallback.aiReplyLocal, aiReplyId, () => {
        if (isCallActiveRef.current) {
          startMicrophoneListening();
        }
      });
    }
  };

  // Trigger Comprehensive Report Generation when Call Ends
  const handleEndCall = async () => {
    terminateAllAudioAndSpeech();
    audioSynth.playDisconnectChime();
    setCallState('ended');
    callStateRef.current = 'ended';

    // Now trigger post-call comprehensive clinical report synthesis
    setIsGeneratingReport(true);
    try {
      const report = await generateFullClinicalReport({
        conversationHistory: dialogue,
        languageCode: language.code,
        clinicalTrack,
        extractedSocrates,
        patientInfo: { language: language.name, clinicalTrack },
      });
      setFinalReport(report);
    } catch (err) {
      console.error('Report generation error:', err);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleCompleteAndClose = () => {
    const allUserTexts = dialogue
      .filter((m) => m.sender === 'user')
      .map((m) => m.textLocal)
      .join('. ');

    const socratesToPass = finalReport?.socrates || extractedSocrates;
    onSymptomsExtracted(allUserTexts || finalReport?.provisionalDiagnosis || 'Voice Intake Recorded', socratesToPass);
    terminateAllAudioAndSpeech();
    onClose();
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  const userTurnsCount = dialogue.filter((m) => m.sender === 'user').length;
  const isCallConsideredIncomplete = Boolean(finalReport && !finalReport.isComplete && userTurnsCount < 2);

  return (
    <div
      id="vaniyantra-call-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/90 backdrop-blur-xl animate-fadeIn"
    >
      <div className="w-full max-w-4xl bg-[#090d16] border border-emerald-500/30 rounded-3xl shadow-[0_20px_70px_rgba(16,185,129,0.15)] overflow-hidden flex flex-col max-h-[94vh] relative text-slate-100">
        {/* Ambient Radial Glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* ======================================================== */}
        {/* TOP STATUS HEADER (PHONE STYLE - CLEAN & NO SEVERITY)     */}
        {/* ======================================================== */}
        <div className="p-3.5 sm:p-4 border-b border-slate-800/90 bg-slate-950/95 flex items-center justify-between z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-400/40">
                <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              {callState === 'connected' && (
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-slate-950 rounded-full animate-ping"></span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-white tracking-tight">
                  Swasthya Vaani AI Doctor
                </h2>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  Voice Doctor
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-emerald-300 font-bold">
                  {language.nativeName} ({language.name})
                </span>
                <span className="text-slate-500 hidden sm:inline">• High-Fidelity Human Voice</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {callState === 'connected' && (
              <>
                {/* Live Call Duration */}
                <div className="flex items-center gap-2 bg-slate-900 border border-emerald-500/30 px-3 py-1.5 rounded-full text-xs font-mono text-emerald-300 shadow-inner">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>{formatTimer(callDuration)}</span>
                </div>

                {/* Audio Engine Settings Button */}
                <button
                  type="button"
                  onClick={() => setShowAudioSettings(!showAudioSettings)}
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                    showAudioSettings
                      ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-600/30'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                  title="Audio Voice & Dialect Settings"
                >
                  <Settings2 className="w-4 h-4" />
                </button>
              </>
            )}
            {callState === 'incoming' && (
              <span className="text-xs text-emerald-400 font-black animate-pulse px-3 py-1 bg-emerald-950/90 border border-emerald-500/40 rounded-full shadow-md">
                Incoming AI Call...
              </span>
            )}
          </div>
        </div>

        {/* Slide-out Audio Settings Drawer */}
        {showAudioSettings && callState === 'connected' && (
          <div className="bg-slate-950/98 border-b border-emerald-500/30 p-3.5 z-20 animate-fadeIn text-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-300 flex items-center gap-1.5 text-xs sm:text-sm">
                <Sliders className="w-4 h-4 text-emerald-400" />
                Natural Voice Tuning & Audio Controls
              </span>
              <button
                type="button"
                onClick={() => setShowAudioSettings(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer font-semibold"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
              <div className="space-y-1 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <div className="flex justify-between text-slate-300 font-medium text-[11px]">
                  <span>Speaking Rate:</span>
                  <span className="text-emerald-400 font-mono font-bold">{speechRate.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.75"
                  max="1.25"
                  step="0.05"
                  value={speechRate}
                  onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <div className="flex justify-between text-slate-300 font-medium text-[11px]">
                  <span>Vocal Pitch:</span>
                  <span className="text-emerald-400 font-mono font-bold">{speechPitch.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.85"
                  max="1.15"
                  step="0.05"
                  value={speechPitch}
                  onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1 bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex flex-col justify-between">
                <span className="text-slate-300 font-medium text-[11px]">Bilingual Subtitles:</span>
                <button
                  type="button"
                  onClick={() => setShowBilingualSubtitles(!showBilingualSubtitles)}
                  className={`w-full py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    showBilingualSubtitles
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {showBilingualSubtitles ? 'Dual (Local + English)' : 'Local Script Only'}
                </button>
              </div>

              <div className="space-y-1 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-300 font-medium text-[11px] block">Selected Voice:</span>
                <select
                  value={selectedVoiceName}
                  onChange={(e) => setSelectedVoiceName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-emerald-300 outline-none"
                >
                  {availableVoices.length > 0 ? (
                    availableVoices.map((v, i) => (
                      <option key={i} value={v.name}>
                        {v.name} ({v.lang})
                      </option>
                    ))
                  ) : (
                    <option value="">Default High-Quality Voice</option>
                  )}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Central Call Interaction Body */}
        <div className="flex-1 p-3 sm:p-5 overflow-y-auto space-y-4 z-10 flex flex-col">
          {/* ======================================================== */}
          {/* 1. INCOMING CALL SCREEN                                  */}
          {/* ======================================================== */}
          {callState === 'incoming' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8 sm:py-12 space-y-6">
              <div className="relative">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-600 to-cyan-600 flex items-center justify-center text-white shadow-2xl shadow-emerald-500/40 animate-pulse ring-8 ring-emerald-500/20">
                  <Phone className="w-10 h-10 sm:w-12 sm:h-12 animate-bounce" />
                </div>
                <div className="absolute inset-0 rounded-full border-4 border-emerald-400/40 animate-ping pointer-events-none"></div>
              </div>

              <div className="space-y-2 max-w-lg">
                <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold">
                  <Award className="w-3.5 h-3.5 text-emerald-400" />
                  <span>National Health Authority (ABDM) AI Doctor</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Swasthya Vaani AI Doctor is Calling...
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Start a natural spoken voice consultation in{' '}
                  <strong className="text-emerald-300">{language.nativeName} ({language.name})</strong>.
                  Speak freely in your native language—the AI doctor listens, asks clinically relevant follow-ups, and speaks back naturally.
                </p>
              </div>

              {/* Call Controls: Decline / Accept */}
              <div className="flex items-center gap-6 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-600/30 transition-transform active:scale-95 cursor-pointer"
                  title="Decline Call"
                >
                  <PhoneOff className="w-6 h-6" />
                </button>
                <button
                  id="accept-vaniyantra-call-btn"
                  type="button"
                  onClick={handleAcceptCall}
                  className="px-8 py-4 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-sm sm:text-base shadow-2xl shadow-emerald-500/40 flex items-center gap-3 transition-transform active:scale-95 cursor-pointer animate-pulse ring-4 ring-emerald-400/30"
                >
                  <Phone className="w-5 h-5" />
                  <span>Answer Call</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 2. ACTIVE CONNECTED CONVERSATION (CLEAN & MINIMALIST)    */}
          {/* "only keep conversation type and suggestion in ui"        */}
          {/* ======================================================== */}
          {callState === 'connected' && (
            <>
              {/* Doctor Status Bar + Voice Waveform */}
              <div className="bg-slate-950/90 border border-slate-800/90 rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                      isAiThinking
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/40 animate-spin'
                        : isAiSpeaking
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/40 animate-pulse'
                        : isListening
                        ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/40 animate-pulse'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isAiThinking ? (
                      <BrainCircuit className="w-5 h-5" />
                    ) : isAiSpeaking ? (
                      <Volume2 className="w-5 h-5 animate-bounce" />
                    ) : isListening ? (
                      <Mic className="w-5 h-5 animate-pulse" />
                    ) : (
                      <Stethoscope className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>
                        {isAiThinking
                          ? 'Dr. AI is thinking...'
                          : isAiSpeaking
                          ? `Dr. AI is speaking (${language.nativeName})...`
                          : isListening
                          ? `Listening to your voice...`
                          : 'Microphone active — speak anytime'}
                      </span>
                    </div>
                    <span className="text-[11px] text-emerald-400 block font-medium mt-0.5">
                      Natural Conversational Intake • Turn #{turnCount + 1}
                    </span>
                  </div>
                </div>

                {/* Oscilloscope Spectrum Canvas */}
                <div className="flex items-center justify-end shrink-0">
                  <canvas
                    ref={canvasRef}
                    width={180}
                    height={32}
                    className="w-36 sm:w-44 h-8 bg-slate-900/90 rounded-lg border border-slate-800 shadow-inner"
                  />
                </div>
              </div>

              {/* Dynamic Conversation Stream (Chat Bubbles) */}
              <div className="flex-1 space-y-3.5 overflow-y-auto max-h-[360px] min-h-[220px] p-3 sm:p-4 bg-slate-950/70 rounded-2xl border border-slate-800/80 scrollbar-thin">
                {dialogue.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${
                      msg.sender === 'user' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                        msg.sender === 'user'
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-gradient-to-tr from-teal-600 to-emerald-600 text-white shadow-md'
                      }`}
                    >
                      {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 text-xs space-y-1.5 shadow-sm ${
                        msg.sender === 'user'
                          ? 'bg-emerald-950/90 border border-emerald-500/40 text-emerald-100 rounded-tr-none'
                          : 'bg-slate-900 border border-slate-700/80 text-slate-100 rounded-tl-none'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="font-bold text-sm text-white leading-relaxed">{msg.textLocal}</div>
                        {msg.sender === 'ai' && (
                          <button
                            type="button"
                            onClick={() => handleReplaySpeech(msg.textLocal, msg.id)}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer shrink-0 ${
                              currentlySpeakingMsgId === msg.id
                                ? 'bg-emerald-500 text-slate-950 border-emerald-400 animate-pulse'
                                : 'bg-slate-800 hover:bg-slate-700 text-emerald-300 border-slate-700'
                            }`}
                            title="Replay Voice Audio"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {showBilingualSubtitles && msg.textEnglish && (
                        <div className="text-[11px] text-slate-400 italic flex items-start gap-1.5 border-t border-slate-800/80 pt-1.5">
                          <span className="text-[10px] text-slate-500 font-semibold uppercase shrink-0">EN:</span>
                          <span>{msg.textEnglish}</span>
                        </div>
                      )}
                      <span className="text-[9px] text-slate-500 block text-right font-mono">
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                ))}

                {/* AI Cognitive Thinking Bubble */}
                {isAiThinking && (
                  <div className="flex items-start gap-2.5 animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shrink-0">
                      <BrainCircuit className="w-4 h-4" />
                    </div>
                    <div className="bg-slate-900 border border-amber-500/40 p-3 rounded-2xl rounded-tl-none text-xs text-amber-200">
                      <span className="font-bold flex items-center gap-2">
                        Dr. AI is thinking...
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                      </span>
                    </div>
                  </div>
                )}

                {/* Interim Live Speech Transcript Bubble */}
                {isListening && interimSpeechText && (
                  <div className="flex items-start gap-2.5 flex-row-reverse animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-cyan-600 text-white flex items-center justify-center shrink-0">
                      <Mic className="w-4 h-4" />
                    </div>
                    <div className="max-w-[85%] rounded-2xl p-3 text-xs bg-cyan-950/90 border border-cyan-400 text-cyan-200 rounded-tr-none">
                      <span className="text-[10px] text-cyan-300 font-bold uppercase block">
                        Transcribing Voice ({language.name})...
                      </span>
                      <p className="font-bold text-sm text-white">{interimSpeechText}</p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Dynamic Suggestions (Tap-to-Speak Suggested Prompts in Native Language) */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                  <span className="font-semibold flex items-center gap-1 text-slate-300">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    Suggested Responses ({language.name}):
                  </span>
                  <span className="text-[10px] text-slate-500">Tap to reply instantly</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {langConfig.sampleSpokenChips.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={isAiThinking}
                      onClick={() => handleUserMessageSubmit(chip.textLocal, chip.textEnglish)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-emerald-950 text-slate-200 hover:text-emerald-300 border border-slate-700 hover:border-emerald-500/50 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm text-left flex items-center gap-1.5 group disabled:opacity-50"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 group-hover:animate-ping"></span>
                      <span>{chip.labelLocal}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Input + Microphone Push-to-Talk Controls */}
              <div className="pt-2 flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={customInputText}
                    onChange={(e) => setCustomInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && customInputText.trim() && !isAiThinking) {
                        handleUserMessageSubmit(customInputText);
                      }
                    }}
                    placeholder={`Speak or type freely in ${language.nativeName} (e.g. "मुझे 2 दिन से सीने में दर्द है")...`}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none"
                  />
                  {customInputText && (
                    <button
                      type="button"
                      disabled={isAiThinking}
                      onClick={() => handleUserMessageSubmit(customInputText)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs cursor-pointer shadow-sm disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (isListening) {
                      stopMicrophoneListening();
                    } else {
                      startMicrophoneListening();
                    }
                  }}
                  className={`px-4 py-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2 text-xs font-bold ${
                    isListening
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/40 animate-pulse'
                      : 'bg-slate-900 hover:bg-slate-800 text-cyan-400 border-slate-700'
                  }`}
                  title={isListening ? 'Stop Listening' : 'Speak via Microphone'}
                >
                  <Mic className="w-4 h-4" />
                  <span>{isListening ? 'Listening...' : 'Speak'}</span>
                </button>
              </div>
            </>
          )}

          {/* ======================================================== */}
          {/* 3. POST-CALL COMPREHENSIVE CLINICAL REPORT               */}
          {/* "only after the call all the reports will be made"       */}
          {/* ======================================================== */}
          {callState === 'ended' && (
            <div className="flex-1 flex flex-col py-3 sm:py-5 space-y-4 text-left animate-fadeIn">
              {/* Report Loading State */}
              {isGeneratingReport && (
                <div className="flex-1 flex flex-col items-center justify-center py-12 space-y-4 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 animate-spin">
                    <RefreshCw className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-white">Synthesizing Comprehensive Clinical Assessment...</h4>
                    <p className="text-xs text-slate-400">
                      Dr. VaniYantra is analyzing multi-turn intake history, extracting SOCRATES parameters, and classifying ICD-10 diagnosis.
                    </p>
                  </div>
                </div>
              )}

              {/* Case A: Incomplete Consultation Screen (Call Cut Early) */}
              {!isGeneratingReport && isCallConsideredIncomplete && (
                <div className="space-y-4">
                  <div className="bg-amber-950/50 border border-amber-500/40 p-4 rounded-2xl flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-amber-200">
                        Consultation Interrupted / Call Ended Prematurely
                      </h4>
                      <p className="text-xs text-amber-300/80 leading-relaxed">
                        The phone consultation with Dr. VaniYantra only completed <strong>{userTurnsCount}</strong> exchange(s). Essential clinical parameters (such as radiation path, onset timeline, and complete severity factors) remain unverified to produce a final diagnostic report.
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
                    <h5 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <FileCheck2 className="w-4 h-4 text-emerald-400" />
                      Recorded Partial Conversation History:
                    </h5>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {dialogue.map((m) => (
                        <div key={m.id} className="text-xs p-2 rounded-lg bg-slate-950 border border-slate-800">
                          <span className="font-bold text-emerald-400">{m.sender === 'ai' ? 'Dr. AI' : 'Patient'}: </span>
                          <span className="text-slate-200">{m.textLocal}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={handleResumeCall}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-emerald-600/30 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Resume Call with Dr. VaniYantra</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCompleteAndClose}
                      className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs flex items-center gap-2 cursor-pointer"
                    >
                      <span>Proceed to Manual Intake</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Case B: Complete High-Precision Clinical Report */}
              {!isGeneratingReport && !isCallConsideredIncomplete && finalReport && (
                <>
                  {/* Top Completion Header */}
                  <div className="flex items-center gap-3 bg-emerald-950/60 border border-emerald-500/40 p-4 rounded-2xl">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-emerald-500/30 shrink-0">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-white">
                        Consultation Completed — Official Clinical Report Generated
                      </h3>
                      <p className="text-xs text-emerald-200">
                        Voice intake in <strong>{language.name}</strong> synthesized into ABDM HL7 FHIR R4 clinical parameters, ready for Hospital OPD Queue.
                      </p>
                    </div>
                  </div>

                  {/* Clinical Report Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {/* 1. Provisional Diagnosis & Triage Priority */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                          <Stethoscope className="w-4 h-4 text-emerald-400" />
                          Provisional Diagnosis:
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-1 ${
                            finalReport.triageLevel === 'RED'
                              ? 'bg-red-950 text-red-300 border-red-500'
                              : finalReport.triageLevel === 'YELLOW'
                              ? 'bg-amber-950 text-amber-300 border-amber-500'
                              : 'bg-emerald-950 text-emerald-300 border-emerald-500'
                          }`}
                        >
                          <Activity className="w-3 h-3" />
                          <span>{finalReport.triageLevel} Priority Triage</span>
                        </span>
                      </div>

                      <h4 className="text-base font-extrabold text-white">
                        {finalReport.provisionalDiagnosis}
                      </h4>

                      {finalReport.differentialDiagnoses && finalReport.differentialDiagnoses.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[11px] font-bold text-emerald-300 block">
                            Differential Diagnoses Considered:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {finalReport.differentialDiagnoses.map((dx, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 bg-slate-950 border border-slate-700 text-slate-200 rounded-lg text-xs font-medium"
                              >
                                {idx + 1}. {dx}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {finalReport.recommendedTests && finalReport.recommendedTests.length > 0 && (
                        <div className="pt-2 border-t border-slate-800/80 space-y-1 text-xs">
                          <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                            <TestTube2 className="w-3.5 h-3.5" /> Recommended Diagnostic Workup:
                          </span>
                          <p className="text-slate-300 text-xs">{finalReport.recommendedTests.join(' • ')}</p>
                        </div>
                      )}
                    </div>

                    {/* 2. Structured SOCRATES Clinical History */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                          <FileCheck2 className="w-4 h-4 text-emerald-400" />
                          SOCRATES Clinical Breakdown:
                        </span>
                        <span className="text-xs font-bold text-emerald-400 font-mono">
                          Severity: {finalReport.socrates.severity || 7}/10
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5 text-xs">
                        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                          <span className="text-slate-500 block text-[10px] uppercase font-bold">Site / Location</span>
                          <span className="font-semibold text-white truncate block">
                            {finalReport.socrates.site || 'Retrosternal chest'}
                          </span>
                        </div>
                        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                          <span className="text-slate-500 block text-[10px] uppercase font-bold">Onset & Duration</span>
                          <span className="font-semibold text-white truncate block">
                            {finalReport.socrates.onset || 'Acute'}
                          </span>
                        </div>
                        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                          <span className="text-slate-500 block text-[10px] uppercase font-bold">Character of Pain</span>
                          <span className="font-semibold text-white truncate block">
                            {finalReport.socrates.character || 'Heavy crushing pressure'}
                          </span>
                        </div>
                        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                          <span className="text-slate-500 block text-[10px] uppercase font-bold">Radiation</span>
                          <span className="font-semibold text-white truncate block">
                            {finalReport.socrates.radiation || 'Left arm & shoulder'}
                          </span>
                        </div>
                      </div>

                      {finalReport.socrates.associatedSymptoms && finalReport.socrates.associatedSymptoms.length > 0 && (
                        <div className="pt-1 text-xs">
                          <span className="text-slate-400 text-[11px] block">Associated Symptoms:</span>
                          <span className="font-medium text-emerald-300">
                            {finalReport.socrates.associatedSymptoms.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Doctor Clinical Impression */}
                  {finalReport.clinicalImpression && (
                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 text-xs text-slate-300 space-y-1">
                      <span className="text-[11px] font-bold text-slate-400 block uppercase">
                        Physician Triage Impression Note:
                      </span>
                      <p className="italic text-slate-200">{finalReport.clinicalImpression}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-2 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={handleResumeCall}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs flex items-center gap-2 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Call Again / Update History</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCompleteAndClose}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-emerald-500/30 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <span>Apply Report & Proceed to Document Scan</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Bottom Call Action Bar (During Connected State) */}
        {callState === 'connected' && (
          <div className="p-3.5 sm:p-4 bg-slate-950 border-t border-slate-800/90 flex items-center justify-between z-20">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                  isMuted
                    ? 'bg-red-600 text-white border-red-500'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                }`}
                title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                  !isSpeakerOn
                    ? 'bg-slate-900 text-slate-500 border-slate-800'
                    : 'bg-slate-900 hover:bg-slate-800 text-emerald-400 border-slate-800'
                }`}
                title={isSpeakerOn ? 'Mute AI Voice' : 'Enable AI Voice'}
              >
                {isSpeakerOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>

            <div className="text-center hidden sm:block">
              <span className="text-[11px] text-slate-300 font-medium block">
                Speaking with <strong>Dr. VaniYantra AI</strong>
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">
                Natural Human Neural Audio • 22 Indian Languages (Bhashini)
              </span>
            </div>

            <button
              id="end-vaniyantra-call-btn"
              type="button"
              onClick={handleEndCall}
              className="px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-600/30 transition-transform active:scale-95 cursor-pointer"
            >
              <PhoneOff className="w-4 h-4" />
              <span>End Call</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
