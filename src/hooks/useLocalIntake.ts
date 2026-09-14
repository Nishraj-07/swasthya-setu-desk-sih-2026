import { useState } from 'react';
import {
  Message,
  SocratesData,
  initialSocrates,
  evaluateConversationState,
} from '../services/localSocratesService';

export const useLocalIntake = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [socrates, setSocrates] = useState<SocratesData>(initialSocrates);
  const [isCallActive, setIsCallActive] = useState(false);

  const processTurn = (inputText: string, isVoice: boolean = false) => {
    const trimmed = inputText.trim();
    if (!trimmed) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const nextHistory = [...messages, userMsg];

    // 1. Evaluate conversation state with instant non-repeating progression
    const evalState = evaluateConversationState(messages, trimmed);
    setSocrates(evalState.socrates);

    const doctorReply = evalState.nextQuestion;
    const doctorMsg: Message = {
      id: (Date.now() + 1).toString(),
      sender: 'doctor',
      text: doctorReply,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([...nextHistory, doctorMsg]);

    // 2. Instant voice playback if in active call
    if (isVoice || isCallActive) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(doctorReply);
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  return {
    messages,
    socrates,
    isCallActive,
    setIsCallActive,
    processTurn,
  };
};
