import {
  type Message,
  type SocratesData,
  type SocratesKey,
  SOCRATES_KEYS,
  SOCRATES_QUESTIONS,
  SOCRATES_COMPLETION_MESSAGE,
  initialSocrates,
  parseSocratesLocally,
  getNextQuestion,
  evaluateConversationState,
} from './localSocratesService';

export type { Message, SocratesData, SocratesKey };
export {
  SOCRATES_KEYS,
  SOCRATES_QUESTIONS,
  SOCRATES_COMPLETION_MESSAGE,
  initialSocrates,
  parseSocratesLocally,
  getNextQuestion,
  evaluateConversationState,
};

// Deterministic Doctor response using instant local rule-based engine (zero API, zero rate limits)
// Guarantees:
// 1. Asks all 8 SOCRATES dimensions
// 2. NO question is ever asked again once the patient provides input
// 3. If no input is given, only then asks the pending question again
export async function getDoctorResponse(
  _geminiClient: any,
  history: Message[],
  latestInput: string
): Promise<string> {
  const evalState = evaluateConversationState(history, latestInput);
  return evalState.nextQuestion;
}

// Deterministic parameter extraction (instant rule-based local parser)
export async function extractSocratesParameters(
  _geminiClient: any,
  fullHistory: Message[]
): Promise<SocratesData> {
  const evalState = evaluateConversationState(fullHistory, '');
  return evalState.socrates;
}
