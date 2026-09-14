export interface Message {
  id: string;
  sender: 'user' | 'doctor';
  text: string;
  timestamp: string;
}

export interface SocratesData {
  site: string;
  onset: string;
  character: string;
  radiation: string;
  associations: string;
  timing_duration: string;
  exacerbating_factors: string;
  severity: string;
}

export type SocratesKey =
  | 'site'
  | 'onset'
  | 'character'
  | 'radiation'
  | 'associations'
  | 'timing_duration'
  | 'exacerbating_factors'
  | 'severity';

export const SOCRATES_KEYS: SocratesKey[] = [
  'site',
  'onset',
  'character',
  'radiation',
  'associations',
  'timing_duration',
  'exacerbating_factors',
  'severity',
];

export const initialSocrates: SocratesData = {
  site: 'Unspecified',
  onset: 'Unspecified',
  character: 'Unspecified',
  radiation: 'Unspecified',
  associations: 'Unspecified',
  timing_duration: 'Unspecified',
  exacerbating_factors: 'Unspecified',
  severity: 'Unspecified',
};

export const SOCRATES_QUESTIONS: Record<SocratesKey, string> = {
  site: 'Where in your body are you experiencing the discomfort or symptoms?',
  onset: 'Did this discomfort begin suddenly all at once, or did it develop gradually over time?',
  character: 'How would you describe the feeling—is it sharp, dull aching, burning, cramping, or heavy pressure?',
  radiation: 'Does the discomfort stay in one spot, or does it radiate or spread anywhere else, like to your back, shoulder, or jaw?',
  associations: 'Are you noticing any other symptoms like fever, nausea, vomiting, dizziness, or shortness of breath?',
  timing_duration: 'How long have you been experiencing this, or how many hours or days ago did it begin?',
  exacerbating_factors: 'Does anything specific make the discomfort better or worse, such as eating, resting, or moving around?',
  severity: 'On a scale from 1 to 10, how severe is the pain or discomfort right now?',
};

export const SOCRATES_COMPLETION_MESSAGE =
  'Thank you. I have documented all of your SOCRATES clinical details. Your comprehensive triage intake profile is complete.';

// Detect which SOCRATES dimension a doctor utterance was asking about
export function detectQuestionKey(doctorQuestionText: string): SocratesKey | null {
  if (!doctorQuestionText) return null;
  const lower = doctorQuestionText.toLowerCase();

  if (/where in your body|which part|location|where is it|where are you experiencing/i.test(lower)) return 'site';
  if (/sudden|gradual|start suddenly|develop gradually|come on suddenly|begin suddenly/i.test(lower)) return 'onset';
  if (/describe the feeling|what does the pain feel like|sharp|dull aching|burning|cramping|sensation|heavy pressure/i.test(lower)) return 'character';
  if (/radiat|spread|stay in one spot|anywhere else|to your back/i.test(lower)) return 'radiation';
  if (/other symptoms|associated symptoms|nausea|fever|vomiting|dizziness|breath/i.test(lower)) return 'associations';
  if (/how long|how many hours|how many days|when did it begin|duration/i.test(lower)) return 'timing_duration';
  if (/better or worse|make the discomfort|eating|resting|moving around|exacerbat/i.test(lower)) return 'exacerbating_factors';
  if (/scale from 1 to 10|scale of 1 to 10|how severe|rate your pain|out of 10/i.test(lower)) return 'severity';

  return null;
}

// Explicit keyword extractor for free-form patient text
export function extractExplicitKeywords(text: string): Partial<SocratesData> {
  const lower = text.toLowerCase();
  const result: Partial<SocratesData> = {};

  // Site
  if (/\b(stomach|abdomen|belly|tummy|gut)\b/i.test(lower)) result.site = 'Abdomen / Stomach';
  else if (/\b(chest|heart|sternum|ribs)\b/i.test(lower)) result.site = 'Chest';
  else if (/\b(head|headache|migraine|temple|forehead)\b/i.test(lower)) result.site = 'Head';
  else if (/\b(throat|neck)\b/i.test(lower)) result.site = 'Throat / Neck';
  else if (/\b(back|lumbar|spine|lower back|upper back)\b/i.test(lower)) result.site = 'Back';
  else if (/\b(shoulder|arm|leg|knee|foot|hand|wrist|ankle)\b/i.test(lower)) {
    const extremityMatch = lower.match(/\b(shoulder|arm|leg|knee|foot|hand|wrist|ankle)\b/i);
    if (extremityMatch) result.site = extremityMatch[1].charAt(0).toUpperCase() + extremityMatch[1].slice(1);
  }

  // Onset
  if (/\b(sudden|instant|abrupt|all of a sudden|out of nowhere|suddenly)\b/i.test(lower)) {
    result.onset = 'Sudden onset';
  } else if (/\b(gradual|slowly|over time|built up|gradually|since morning)\b/i.test(lower)) {
    result.onset = 'Gradual onset';
  }

  // Character
  if (/\b(sharp|stabbing|knife-like|piercing)\b/i.test(lower)) {
    result.character = 'Sharp / Stabbing';
  } else if (/\b(dull|aching|constant ache|nagging|dull ache)\b/i.test(lower)) {
    result.character = 'Dull / Aching';
  } else if (/\b(burning|acid|heartburn|scorching)\b/i.test(lower)) {
    result.character = 'Burning';
  } else if (/\b(cramp|cramping|colicky|throbbing|pulsating)\b/i.test(lower)) {
    result.character = 'Cramping / Throbbing';
  } else if (/\b(pressure|tightness|heavy|squeezing|constriction)\b/i.test(lower)) {
    result.character = 'Tightness / Pressure';
  }

  // Radiation
  if (/\b(radiat|travel|spread|shooting down|moving to)\b/i.test(lower)) {
    if (/\b(arm|shoulder|jaw|neck)\b/i.test(lower)) result.radiation = 'Radiating to arm/shoulder/jaw';
    else if (/\b(back|scapula)\b/i.test(lower)) result.radiation = 'Radiating to back';
    else if (/\b(groin|thigh|leg)\b/i.test(lower)) result.radiation = 'Radiating to groin/thigh';
    else result.radiation = 'Radiating to surrounding area';
  } else if (/\b(nowhere|stays there|no radiation|only in one spot|localized|same place|just there|no spread)\b/i.test(lower)) {
    result.radiation = 'None (localized)';
  }

  // Associations
  const syms = [];
  if (/\b(nausea|vomit|throwing up|queasy|puking)\b/i.test(lower)) syms.push('Nausea/Vomiting');
  if (/\b(fever|chills|high temp|shivering|pyrexia)\b/i.test(lower)) syms.push('Fever');
  if (/\b(dizz|lightheaded|fainting|vertigo|giddiness)\b/i.test(lower)) syms.push('Dizziness');
  if (/\b(breath|shortness of breath|dyspnea|gasping|breathless)\b/i.test(lower)) syms.push('Breathlessness');
  if (/\b(sweating|diaphoresis|cold sweat|perspiring)\b/i.test(lower)) syms.push('Cold sweats');
  if (syms.length > 0) result.associations = syms.join(', ');
  else if (/\b(no other|nothing else|no symptoms|no fever|none|nope|no)\b/i.test(lower) && !syms.length) {
    result.associations = 'None reported';
  }

  // Timing / Duration
  const timeMatch = lower.match(/\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s*(days?|hours?|weeks?|months?|minutes?|years?)\b/i);
  if (timeMatch) {
    result.timing_duration = `${timeMatch[1]} ${timeMatch[2]}`;
  } else if (/\b(since yesterday|since last night|since this morning|since today)\b/i.test(lower)) {
    const sinceMatch = lower.match(/\b(since yesterday|since last night|since this morning|since today)\b/i);
    if (sinceMatch) result.timing_duration = sinceMatch[0].charAt(0).toUpperCase() + sinceMatch[0].slice(1);
  } else if (/\b(few days|several hours|few weeks|few hours)\b/i.test(lower)) {
    const fewMatch = lower.match(/\b(few days|several hours|few weeks|few hours)\b/i);
    if (fewMatch) result.timing_duration = fewMatch[0].charAt(0).toUpperCase() + fewMatch[0].slice(1);
  }

  // Exacerbating / Relieving Factors
  if (/\b(worse (after|with) (eating|food|meals)|after eating|eating)\b/i.test(lower)) {
    result.exacerbating_factors = 'Worse after meals';
  } else if (/\b(walking|moving|exercise|bending|activity)\b/i.test(lower) && /\b(worse|hurts more|aggravates|increases)\b/i.test(lower)) {
    result.exacerbating_factors = 'Aggravated by movement';
  } else if (/\b(rest|lying down|sitting)\b/i.test(lower) && /\b(better|relieved|helps|improves|eases)\b/i.test(lower)) {
    result.exacerbating_factors = 'Relieved by rest';
  } else if (/\b(nothing|no|none|not really|dont know|don't know|no idea)\b/i.test(lower)) {
    result.exacerbating_factors = 'No specific triggers identified';
  }

  // Severity
  const sevMatch = lower.match(/\b([1-9]|10)\s*(\/|\s*out of\s*)\s*10\b/i);
  const plainNumMatch = lower.match(/\b([1-9]|10)\b/);
  if (sevMatch) {
    result.severity = `${sevMatch[1]}/10`;
  } else if (/\b(mild|minor|slight|not too bad|bearable|little bit)\b/i.test(lower)) {
    result.severity = 'Mild (1-3/10)';
  } else if (/\b(moderate|medium|average)\b/i.test(lower)) {
    result.severity = 'Moderate (4-6/10)';
  } else if (/\b(severe|unbearable|worst pain|excruciating|intense|very bad|terrible)\b/i.test(lower)) {
    result.severity = 'Severe (7-10/10)';
  } else if (plainNumMatch && !result.timing_duration) {
    result.severity = `${plainNumMatch[1]}/10`;
  }

  return result;
}

// 1. Instant Rule-Based Local Extractor (No API, No Hallucination / Imputation)
export function parseSocratesLocally(text: string, current: SocratesData): SocratesData {
  if (!text || !text.trim()) return current;
  const explicit = extractExplicitKeywords(text);
  return {
    ...current,
    ...explicit,
  };
}

// Complete conversation state evaluator that ensures NO question is EVER repeated once input is given
export function evaluateConversationState(history: Message[], latestInput: string): {
  socrates: SocratesData;
  answeredKeys: Set<SocratesKey>;
  nextQuestion: string;
} {
  const socratesState: SocratesData = { ...initialSocrates };
  const answeredKeys = new Set<SocratesKey>();
  let lastDoctorQuestionKey: SocratesKey | null = null;

  // Replay complete message history
  for (const msg of history) {
    if (msg.sender === 'doctor') {
      const qKey = detectQuestionKey(msg.text);
      if (qKey) {
        lastDoctorQuestionKey = qKey;
      }
    } else if (msg.sender === 'user') {
      const userText = msg.text.trim();
      if (userText.length > 0) {
        // 1. Extract explicit keywords
        const explicit = extractExplicitKeywords(userText);
        for (const [key, value] of Object.entries(explicit) as [SocratesKey, string][]) {
          if (value && value !== 'Unspecified') {
            socratesState[key] = value;
            answeredKeys.add(key);
          }
        }

        // 2. If user answered the pending doctor question, mark it answered!
        if (lastDoctorQuestionKey) {
          answeredKeys.add(lastDoctorQuestionKey);
          if (socratesState[lastDoctorQuestionKey] === 'Unspecified') {
            // Fill with sanitized user answer so it is never 'Unspecified'
            if (/^(no|none|nothing|nowhere|nope|na|not really|nil)$/i.test(userText)) {
              if (lastDoctorQuestionKey === 'radiation') socratesState.radiation = 'None (localized)';
              else if (lastDoctorQuestionKey === 'associations') socratesState.associations = 'None reported';
              else if (lastDoctorQuestionKey === 'exacerbating_factors') socratesState.exacerbating_factors = 'No triggers reported';
              else socratesState[lastDoctorQuestionKey] = 'None / Negative';
            } else {
              socratesState[lastDoctorQuestionKey] = userText;
            }
          }
          lastDoctorQuestionKey = null;
        }
      }
    }
  }

  // Now process the latestInput
  const trimmedLatest = latestInput.trim();
  if (trimmedLatest.length > 0) {
    // 1. Extract explicit keywords from latest input
    const explicit = extractExplicitKeywords(trimmedLatest);
    for (const [key, value] of Object.entries(explicit) as [SocratesKey, string][]) {
      if (value && value !== 'Unspecified') {
        socratesState[key] = value;
        answeredKeys.add(key);
      }
    }

    // 2. Mark the pending question as answered
    if (lastDoctorQuestionKey) {
      answeredKeys.add(lastDoctorQuestionKey);
      if (socratesState[lastDoctorQuestionKey] === 'Unspecified') {
        if (/^(no|none|nothing|nowhere|nope|na|not really|nil)$/i.test(trimmedLatest)) {
          if (lastDoctorQuestionKey === 'radiation') socratesState.radiation = 'None (localized)';
          else if (lastDoctorQuestionKey === 'associations') socratesState.associations = 'None reported';
          else if (lastDoctorQuestionKey === 'exacerbating_factors') socratesState.exacerbating_factors = 'No triggers reported';
          else socratesState[lastDoctorQuestionKey] = 'None / Negative';
        } else {
          socratesState[lastDoctorQuestionKey] = trimmedLatest;
        }
      }
      lastDoctorQuestionKey = null;
    }
  }

  // Find the next unanswered question in sequence
  let nextKey: SocratesKey | null = null;
  for (const k of SOCRATES_KEYS) {
    if (!answeredKeys.has(k) && socratesState[k] === 'Unspecified') {
      nextKey = k;
      break;
    }
  }

  // If latest input was empty AND there was a pending question that wasn't answered
  if (trimmedLatest.length === 0 && lastDoctorQuestionKey) {
    nextKey = lastDoctorQuestionKey;
  }

  const nextQuestion = nextKey ? SOCRATES_QUESTIONS[nextKey] : SOCRATES_COMPLETION_MESSAGE;

  return {
    socrates: socratesState,
    answeredKeys,
    nextQuestion,
  };
}

// 2. Next Deterministic Question Selector
export function getNextQuestion(socrates: SocratesData, answeredKeys?: Set<SocratesKey>): string {
  for (const k of SOCRATES_KEYS) {
    if (socrates[k] === 'Unspecified' && (!answeredKeys || !answeredKeys.has(k))) {
      return SOCRATES_QUESTIONS[k];
    }
  }
  return SOCRATES_COMPLETION_MESSAGE;
}
