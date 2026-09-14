/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Volume2,
  VolumeX,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Play,
  Pause,
  X,
  CheckCircle2,
  HelpCircle,
  Stethoscope,
  Radio,
  Sliders,
  ChevronRight,
  Maximize2,
  Minimize2,
  Zap,
} from 'lucide-react';
import { BhashiniLanguage, KioskStep } from '../types';
import { GuideStepItem, getGuideStepsForStep, AI_SPEAKER_GUIDE_STEPS } from '../data/aiSpeakerGuideData';
import { naturalSpeech } from '../utils/naturalSpeechEngine';
import { audioSynth } from '../utils/audioSynthesizer';

interface AiSpeakerGuideProps {
  currentStep: KioskStep;
  language: BhashiniLanguage;
  onAutoFillDemo?: () => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const AiSpeakerGuide: React.FC<AiSpeakerGuideProps> = ({
  currentStep,
  language,
  onAutoFillDemo,
  isOpen,
  onToggleOpen,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAutoPlayEnabled, setIsAutoPlayEnabled] = useState(true);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [speechRate, setSpeechRate] = useState(0.92);
  const [showSettings, setShowSettings] = useState(false);
  const [highlightVisible, setHighlightVisible] = useState(true);

  const availableSteps = getGuideStepsForStep(currentStep);
  const currentGuide = availableSteps[currentStepIndex] || availableSteps[0] || AI_SPEAKER_GUIDE_STEPS[0];

  const targetElementRef = useRef<HTMLElement | null>(null);
  const animIntervalRef = useRef<any>(null);

  // Reset step index when the kiosk step changes
  useEffect(() => {
    setCurrentStepIndex(0);
  }, [currentStep]);

  // Locate target DOM element and calculate position for Spotlight Highlighting
  const updateTargetPosition = useCallback(() => {
    if (!isOpen || !currentGuide) {
      setTargetRect(null);
      return;
    }

    const selector = currentGuide.targetSelector;
    const el = document.querySelector(selector) as HTMLElement | null;

    if (el) {
      targetElementRef.current = el;
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);

      // Smoothly scroll the element into view if not in viewport
      const isInViewport =
        rect.top >= 80 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) - 80 &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth);

      if (!isInViewport) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      setTargetRect(null);
    }
  }, [isOpen, currentGuide]);

  // Recalculate target position on resize, scroll, and step change
  useEffect(() => {
    updateTargetPosition();

    const handleUpdate = () => updateTargetPosition();
    window.addEventListener('resize', handleUpdate);
    window.addEventListener('scroll', handleUpdate, true);

    // Periodic check in case DOM is animating or rendering asynchronously
    const interval = setInterval(updateTargetPosition, 600);

    return () => {
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('scroll', handleUpdate, true);
      clearInterval(interval);
    };
  }, [updateTargetPosition]);

  // Speak the guidance audio whenever the current guide step or language changes
  const speakCurrentStep = useCallback(async () => {
    if (!isOpen || !currentGuide) return;

    naturalSpeech.stop();
    setIsSpeaking(true);

    const langCode = language.code;
    const textToSpeak =
      currentGuide.speechText[langCode] ||
      currentGuide.speechText['hi'] ||
      currentGuide.speechText['en'] ||
      '';

    audioSynth.playDiagnosticPulse();

    await naturalSpeech.speak(textToSpeak, language.code, language.speechCode, {
      rate: speechRate,
      pitch: 1.0,
      onStart: () => setIsSpeaking(true),
      onEnd: () => {
        setIsSpeaking(false);
      },
      onError: () => setIsSpeaking(false),
    });
  }, [isOpen, currentGuide, language.code, language.speechCode, speechRate]);

  // Trigger speech when guide opens or step advances if auto-play is enabled
  useEffect(() => {
    if (isOpen && isAutoPlayEnabled && currentGuide) {
      const timer = setTimeout(() => {
        speakCurrentStep();
      }, 400);
      return () => {
        clearTimeout(timer);
        naturalSpeech.stop();
      };
    } else {
      naturalSpeech.stop();
      setIsSpeaking(false);
    }
  }, [isOpen, currentGuide?.id, isAutoPlayEnabled]);

  const handleNextStep = () => {
    if (currentStepIndex < availableSteps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      // Loop or restart
      setCurrentStepIndex(0);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleRepeatSpeech = () => {
    speakCurrentStep();
  };

  const handleStopSpeech = () => {
    naturalSpeech.stop();
    setIsSpeaking(false);
  };

  if (!isOpen) {
    return (
      <button
        id="btn-open-ai-speaker-guide"
        type="button"
        onClick={onToggleOpen}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-3 px-5 py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-full shadow-[0_10px_35px_rgba(16,185,129,0.4)] border-2 border-white/40 transition-all transform hover:scale-105 active:scale-95 cursor-pointer group"
        title="Start AI Voice Guide & Interactive Speaker"
      >
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-white text-emerald-700 flex items-center justify-center font-bold shadow-md">
            <Volume2 className="w-5 h-5 animate-pulse" />
          </div>
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-emerald-900 animate-ping"></span>
        </div>
        <div className="text-left">
          <span className="text-xs font-black block tracking-tight">AI Voice Guide 📢</span>
          <span className="text-[10px] text-emerald-100 font-medium">
            {language.nativeName} ({language.name}) Assistant
          </span>
        </div>
      </button>
    );
  }

  const currentTitle =
    currentGuide.title[language.code] ||
    currentGuide.title['hi'] ||
    currentGuide.title['en'] ||
    'Guide Step';

  const currentSpeech =
    currentGuide.speechText[language.code] ||
    currentGuide.speechText['hi'] ||
    currentGuide.speechText['en'] ||
    '';

  const currentTip =
    currentGuide.actionTip[language.code] ||
    currentGuide.actionTip['hi'] ||
    currentGuide.actionTip['en'] ||
    'Follow highlighted on-screen instruction';

  return (
    <>
      {/* ======================================================== */}
      {/* 1. VISUAL SPOTLIGHT HALO & DIRECT POINTER ON TARGET      */}
      {/* ======================================================== */}
      {targetRect && highlightVisible && (
        <div
          id="ai-guide-spotlight-halo"
          className="fixed pointer-events-none z-30 transition-all duration-300 ease-out"
          style={{
            top: `${Math.max(0, targetRect.top - 8)}px`,
            left: `${Math.max(0, targetRect.left - 8)}px`,
            width: `${targetRect.width + 16}px`,
            height: `${targetRect.height + 16}px`,
          }}
        >
          {/* Animated Glowing Ring Around Element */}
          <div className="w-full h-full rounded-2xl ring-4 ring-emerald-500/80 shadow-[0_0_35px_rgba(16,185,129,0.7)] animate-pulse bg-emerald-500/5"></div>

          {/* Directional Attention Pointer / Floating Tooltip */}
          <div
            className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-950 text-white border-2 border-emerald-400 text-xs px-3 py-1.5 rounded-full font-bold shadow-xl flex items-center gap-2 whitespace-nowrap animate-bounce"
            style={{ pointerEvents: 'auto' }}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-emerald-300">👉 {currentTip}</span>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. DOCKED AI SPEAKER KIOSK CONTROLLER WIDGET              */}
      {/* ======================================================== */}
      <aside
        aria-label="AI Voice Guide and Registration Assistant"
        id="ai-speaker-guide-dock"
        className={`fixed bottom-4 right-4 z-40 w-full max-w-md sm:max-w-lg transition-all duration-300 ${
          isExpanded ? 'scale-100 opacity-100' : 'scale-95'
        }`}
      >
        <div className="bg-slate-950/95 backdrop-blur-2xl border-2 border-emerald-500/40 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] p-4 sm:p-5 text-slate-100 relative overflow-hidden space-y-3.5 ring-4 ring-emerald-500/10">
          {/* Ambient Top Glow */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500"></div>

          {/* Header Bar */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all ${
                    isSpeaking
                      ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-emerald-500/40 animate-pulse ring-2 ring-emerald-400'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {isSpeaking ? (
                    <Volume2 className="w-6 h-6 animate-bounce" />
                  ) : (
                    <Stethoscope className="w-5 h-5 text-emerald-400" />
                  )}
                </div>
                {isSpeaking && (
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-slate-950 rounded-full animate-ping"></span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-black text-white tracking-tight">
                    AI Voice Guide • Margdarshak
                  </h2>
                  <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full uppercase">
                    {currentGuide.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                  <Radio className="w-3 h-3 text-emerald-400 shrink-0 animate-pulse" />
                  <span>
                    Speaking in <strong className="text-emerald-300">{language.nativeName} ({language.name})</strong>
                  </span>
                </p>
              </div>
            </div>

            {/* Quick Utility Actions */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  showSettings
                    ? 'bg-emerald-600 text-white border-emerald-400'
                    : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
                }`}
                title="Voice Settings"
              >
                <Sliders className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setHighlightVisible(!highlightVisible)}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  highlightVisible
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-900 text-slate-500 border-slate-800'
                }`}
                title={highlightVisible ? 'Hide Spotlight Halo' : 'Show Spotlight Halo'}
              >
                <Zap className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={onToggleOpen}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-all cursor-pointer"
                title="Close Voice Guide"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Voice Tuning Drawer */}
          {showSettings && (
            <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800 text-xs space-y-2 animate-fadeIn">
              <div className="flex justify-between items-center text-slate-300 font-bold text-[11px]">
                <span>Guide Speech Speed:</span>
                <span className="text-emerald-400 font-mono font-bold">{speechRate.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.75"
                max="1.2"
                step="0.05"
                value={speechRate}
                onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          )}

          {/* Live Instruction Banner / Speech Bubble */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 space-y-2 shadow-inner">
            <div className="flex items-start justify-between gap-2">
              <div className="font-extrabold text-sm text-emerald-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{currentTitle}</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800">
                  {currentStepIndex + 1} / {availableSteps.length}
                </span>
              </div>
            </div>

            {/* Spoken Transcript Subtitle in Native Language */}
            <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed">
              "{currentSpeech}"
            </p>

            {/* English Fallback Translation if language is regional */}
            {language.code !== 'en' && currentGuide.speechText['en'] && (
              <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-800">
                <span className="text-[10px] text-slate-500 font-bold uppercase not-italic mr-1">EN:</span>
                {currentGuide.speechText['en']}
              </p>
            )}
          </div>

          {/* Navigation & Audio Control Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            {/* Left Controls: Repeat & Stop */}
            <div className="flex items-center gap-2">
              {isSpeaking ? (
                <button
                  type="button"
                  onClick={handleStopSpeech}
                  className="px-3 py-2 bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>Stop Voice</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleRepeatSpeech}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/30"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Repeat</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsAutoPlayEnabled(!isAutoPlayEnabled)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  isAutoPlayEnabled
                    ? 'bg-slate-900 text-emerald-400 border-emerald-500/40'
                    : 'bg-slate-900 text-slate-500 border-slate-800'
                }`}
                title="Auto-speak next guide step"
              >
                <span>Auto: {isAutoPlayEnabled ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            {/* Right Controls: Prev / Next */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentStepIndex === 0}
                onClick={handlePrevStep}
                className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-40 rounded-xl border border-slate-800 text-xs font-bold cursor-pointer transition-all disabled:cursor-not-allowed"
                title="Previous Instruction"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleNextStep}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/25"
                title="Next Instruction"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
