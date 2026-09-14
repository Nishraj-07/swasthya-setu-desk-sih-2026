/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Sparkles, AlertTriangle } from 'lucide-react';
import { BhashiniLanguage } from '../types';
import { getLocalizedStrings } from '../bhashiniLanguages';
import { naturalSpeech } from '../utils/naturalSpeechEngine';
import {
  GuidanceContextType,
  GuidanceContextData,
  getSituationAwareSpeechText,
} from '../utils/dynamicAudioGuidance';

export interface AudioGuidanceButtonProps {
  promptText?: string;
  contextType?: GuidanceContextType;
  contextData?: GuidanceContextData;
  language: BhashiniLanguage;
  buttonLabel?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'pill' | 'compact' | 'danger' | 'ghost' | 'amber' | 'emerald';
  className?: string;
  onStart?: () => void;
  onEnd?: () => void;
}

export const AudioGuidanceButton: React.FC<AudioGuidanceButtonProps> = ({
  promptText,
  contextType,
  contextData = {},
  language,
  buttonLabel,
  size = 'md',
  variant = 'default',
  className = '',
  onStart,
  onEnd,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const loc = getLocalizedStrings(language?.code || 'hi');

  useEffect(() => {
    // When language changes, stop ongoing audio playback
    if (isPlaying) {
      naturalSpeech.stop();
      setIsPlaying(false);
    }
  }, [language?.code]);

  const computeSpeechText = (): string => {
    if (contextType) {
      return getSituationAwareSpeechText(contextType, contextData, language);
    }
    return promptText || `${loc.audioPromptIdentify} ${loc.audioPromptConsent}`;
  };

  const handleSpeak = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isPlaying) {
      naturalSpeech.stop();
      setIsPlaying(false);
      onEnd?.();
      return;
    }

    const textToSpeak = computeSpeechText();
    setIsPlaying(true);
    onStart?.();

    await naturalSpeech.speak(
      textToSpeak,
      language?.code || 'hi',
      language?.speechCode || `${language?.code || 'hi'}-IN`,
      {
        rate: 0.92,
        pitch: 1.0,
        onStart: () => setIsPlaying(true),
        onEnd: () => {
          setIsPlaying(false);
          onEnd?.();
        },
        onError: () => {
          setIsPlaying(false);
          onEnd?.();
        },
      }
    );
  };

  const sizeClasses =
    size === 'sm'
      ? 'px-3 py-1.5 text-xs'
      : size === 'lg'
      ? 'px-5 py-2.5 text-sm'
      : 'px-4 py-2 text-xs';

  const displayLabel = buttonLabel || loc.audioGuideLabel;

  let variantClasses = 'bg-white text-stone-700 hover:text-[#0C0A09] hover:bg-stone-50 border-stone-200 hover:border-stone-300';

  if (variant === 'pill') {
    variantClasses = 'bg-[#E8E2D9]/50 hover:bg-[#E8E2D9] text-[#0C0A09] border-stone-300/80';
  } else if (variant === 'danger') {
    variantClasses = 'bg-red-50 hover:bg-red-100 text-red-800 border-red-200';
  } else if (variant === 'amber') {
    variantClasses = 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200';
  } else if (variant === 'emerald') {
    variantClasses = 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200';
  } else if (variant === 'compact') {
    variantClasses = 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-transparent';
  } else if (variant === 'ghost') {
    variantClasses = 'bg-transparent hover:bg-stone-100 text-stone-700 border-transparent shadow-none';
  }

  return (
    <button
      id={contextType ? `audio-guidance-btn-${contextType}` : 'audio-guidance-btn'}
      type="button"
      onClick={handleSpeak}
      className={`inline-flex items-center gap-2 font-bold rounded-full border transition-all cursor-pointer select-none shadow-sm ${sizeClasses} ${
        isPlaying
          ? 'bg-[#52833C] text-white border-[#52833C] ring-4 ring-[#52833C]/20 animate-pulse'
          : variantClasses
      } ${className}`}
      title={isPlaying ? loc.stopAudioLabel : displayLabel}
    >
      {isPlaying ? (
        <>
          <VolumeX className="w-4 h-4 text-white shrink-0" />
          <span>{loc.stopAudioLabel}</span>
        </>
      ) : (
        <>
          {variant === 'danger' ? (
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          ) : (
            <Volume2 className="w-4 h-4 text-[#52833C] shrink-0" />
          )}
          <span>{displayLabel}</span>
        </>
      )}
    </button>
  );
};
