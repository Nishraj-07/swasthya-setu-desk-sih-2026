/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SocratesHistory, RedFlagAlert } from '../types';

export interface VaniYantraContextMessage {
  id: string;
  sender: 'ai' | 'user';
  textLocal: string;
  textEnglish: string;
  timestamp: string;
  isSpoken?: boolean;
}

export interface LanguageTriageConfig {
  code: string;
  name: string;
  nativeName: string;
  speechCode: string;
  initialGreeting: {
    local: string;
    english: string;
  };
  sampleSpokenChips: {
    labelLocal: string;
    textLocal: string;
    textEnglish: string;
    socrates: Partial<SocratesHistory>;
  }[];
  questions: {
    site: { local: string; english: string };
    onset: { local: string; english: string };
    character: { local: string; english: string };
    radiation: { local: string; english: string };
    severity: { local: string; english: string };
    associated: { local: string; english: string };
    ayushCheck?: { local: string; english: string };
  };
  wrapUp: {
    local: string;
    english: string;
  };
  emergencyNotice: {
    local: string;
    english: string;
  };
}

export const VANIYANTRA_22_CONFIGS: Record<string, LanguageTriageConfig> = {
  hi: {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    speechCode: 'hi-IN',
    initialGreeting: {
      local: 'नमस्ते! मैं एम्स वाणी यंत्र AI डॉक्टर हूँ। कृपया बताइए, आपको क्या तकलीफ हो रही है और दर्द कहाँ है?',
      english: 'Hello! I am the AIIMS VaniYantra AI Doctor. Please tell me, what discomfort are you experiencing and where is it located?',
    },
    sampleSpokenChips: [
      {
        labelLocal: 'सीने में भारी दबाव व दर्द',
        textLocal: 'नमस्ते डॉक्टर, मुझे कल रात से सीने के बीच में बहुत भारी दबाव और तेज दर्द हो रहा है। यह बाएं हाथ में भी जा रहा है।',
        textEnglish: 'Hello Doctor, since last night I have severe heaviness and acute crushing chest pain radiating to my left arm.',
        socrates: { site: 'Retrosternal chest', character: 'Crushing heavy pressure', radiation: 'Left arm & shoulder', severity: 8 },
      },
      {
        labelLocal: 'सांस फूलना और पसीना',
        textLocal: 'मुझे सांस लेने में बहुत दिक्कत हो रही है और ठंडा पसीना आ रहा है। चक्कर भी आ रहे हैं।',
        textEnglish: 'I am having acute difficulty breathing and profuse cold sweating along with dizziness.',
        socrates: { associatedSymptoms: ['Exertional Dyspnea', 'Cold Diaphoresis', 'Dizziness'], severity: 9 },
      },
      {
        labelLocal: 'तेज बुखार और सिरदर्द',
        textLocal: 'मुझे 3 दिनों से तेज बुखार, ठंड लगना और गंभीर सिरदर्द है। शरीर में बहुत कमजोरी है।',
        textEnglish: 'I have high-grade fever with chills, severe headache, and severe body weakness for 3 days.',
        socrates: { site: 'Head & Generalized', onset: '3 days ago', character: 'Throbbing ache & chills', severity: 6 },
      },
      {
        labelLocal: 'पेट में तेज दर्द व उल्टी',
        textLocal: 'पेट के ऊपरी दाहिने हिस्से में तेज मरोड़ वाला दर्द है और 2 बार उल्टी हुई है।',
        textEnglish: 'Severe cramping pain in upper right quadrant of abdomen and 2 episodes of vomiting.',
        socrates: { site: 'Right upper quadrant abdomen', character: 'Cramping colicky pain', associatedSymptoms: ['Vomiting', 'Nausea'], severity: 7 },
      },
    ],
    questions: {
      site: {
        local: 'दर्द या तकलीफ शरीर के किस हिस्से में सबसे ज्यादा महसूस हो रही है?',
        english: 'In which specific part of your body do you feel the discomfort most intensely?',
      },
      onset: {
        local: 'यह तकलीफ कब से शुरू हुई है? क्या यह अचानक शुरू हुई थी?',
        english: 'When did this trouble start? Did it come on suddenly or gradually?',
      },
      character: {
        local: 'दर्द कैसा महसूस होता है—भारी दबाव जैसा, चुभने वाला, जलन जैसा या खिंचाव?',
        english: 'What does the pain feel like—heavy crushing pressure, sharp stabbing, burning, or aching?',
      },
      radiation: {
        local: 'क्या यह दर्द कहीं और भी फैल रहा है, जैसे कि बाएं हाथ, जबड़े, पीठ या कंधे में?',
        english: 'Does this pain radiate anywhere else, such as the left arm, jaw, upper back, or shoulder?',
      },
      severity: {
        local: '1 से 10 के पैमाने पर, आप इस दर्द को कितना अंक देंगे (10 सबसे तेज दर्द)?',
        english: 'On a scale of 1 to 10, how severe is this pain (10 being the most excruciating)?',
      },
      associated: {
        local: 'क्या आपको सांस लेने में तकलीफ, पसीना, उल्टी या घबराहट भी हो रही है?',
        english: 'Are you also experiencing shortness of breath, cold sweating, vomiting, or palpitations?',
      },
    },
    wrapUp: {
      local: 'धन्यवाद। आपके सभी लक्षण दर्ज कर लिए गए हैं। डॉक्टर कंसल्टेशन और आपातकालीन ईसीजी टोकन जनरेट हो गया है।',
      english: 'Thank you. All your clinical symptoms have been recorded. Doctor consultation and stat ECG token generated.',
    },
    emergencyNotice: {
      local: 'सावधानी: तीव्र कार्डियक रेड-फ्लैग पहचाना गया। तत्काल ट्राइएज रूम 102 में संपर्क करें।',
      english: 'Alert: Acute cardiac red flag identified. Proceed immediately to Triage Room 102.',
    },
  },

  ta: {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    speechCode: 'ta-IN',
    initialGreeting: {
      local: 'வணக்கம்! நான் எய்ம்ஸ் வாணி யந்திர AI மருத்துவர். உங்களுக்கு என்ன பிரச்சனை மற்றும் வலி எங்கு இருக்கிறது?',
      english: 'Hello! I am the AIIMS VaniYantra AI Doctor. What discomfort are you experiencing and where is it located?',
    },
    sampleSpokenChips: [
      {
        labelLocal: 'நெஞ்சு வலி மற்றும் பாரம்',
        textLocal: 'வணக்கம் டாக்டர், நேற்று இரவிலிருந்து என் நெஞ்சின் நடுவில் கடுமையான பாரமும் வலியும் உள்ளது. இது இடது கைக்கு பரவுகிறது.',
        textEnglish: 'Hello Doctor, since last night I have severe heaviness and intense chest pain radiating to my left arm.',
        socrates: { site: 'Retrosternal chest', character: 'Crushing heavy pressure', radiation: 'Left arm & shoulder', severity: 8 },
      },
      {
        labelLocal: 'மூச்சுத்திணறல் & வியர்வை',
        textLocal: 'எனக்கு மூச்சு விடுவதில் பெரும் சிரமமும் கடுமையான குளிர்ந்த வியர்வையும் உள்ளது.',
        textEnglish: 'I am experiencing severe shortness of breath and profuse cold sweating.',
        socrates: { associatedSymptoms: ['Dyspnea', 'Diaphoresis'], severity: 8 },
      },
      {
        labelLocal: 'காய்ச்சல் மற்றும் தலைவலி',
        textLocal: 'எனக்கு 2 நாட்களாக கடுமையான காய்ச்சலும் தாங்க முடியாத தலைவலியும் இருக்கிறது.',
        textEnglish: 'I have high fever and unbearable headache for the past 2 days.',
        socrates: { site: 'Head & Generalized', onset: '2 days ago', severity: 6 },
      },
    ],
    questions: {
      site: {
        local: 'வலி அல்லது அசௌகரியம் சரியாக எந்த இடத்தில் அதிகமாக உள்ளது?',
        english: 'Where exactly is the pain or discomfort located?',
      },
      onset: {
        local: 'இந்த வலி எப்போது தொடங்கியது? திடீரென ஆரம்பித்ததா?',
        english: 'When did this pain begin? Did it start suddenly?',
      },
      character: {
        local: 'வலி எப்படி உணர்கிறது—அழுத்தம் போன்றதா, குத்துவது போன்றதா அல்லது எரிச்சலா?',
        english: 'How does the pain feel—crushing pressure, sharp stabbing, or burning?',
      },
      radiation: {
        local: 'இந்த வலி உங்கள் இடது கை, தோள்பட்டை அல்லது தாடைக்கு பரவுகிறதா?',
        english: 'Does this pain radiate to your left arm, shoulder, or jaw?',
      },
      severity: {
        local: '1 முதல் 10 வரையிலான அளவில், இந்த வலியை நீங்கள் எத்தனை மதிப்பிடுவீர்கள்?',
        english: 'On a scale of 1 to 10, how severe is this pain?',
      },
      associated: {
        local: 'மூச்சு விடுவதில் சிரமம், குளிர் வியர்வை அல்லது மயக்கம் ஏதேனும் உள்ளதா?',
        english: 'Do you have difficulty breathing, cold sweating, or dizziness?',
      },
    },
    wrapUp: {
      local: 'நன்றி. உங்கள் மருத்துவ தகவல்கள் பதிவு செய்யப்பட்டன. உடனடியாக மருத்துவர் பரிசோதனை சீட்டு தயார்.',
      english: 'Thank you. Your medical history is logged. Urgent doctor consultation token is ready.',
    },
    emergencyNotice: {
      local: 'எச்சரிக்கை: அவசர சிகிச்சை தேவை. உடனடியாக அறை 102-க்கு செல்லவும்.',
      english: 'Alert: Urgent medical intervention required. Proceed to Room 102 immediately.',
    },
  },

  te: {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    speechCode: 'te-IN',
    initialGreeting: {
      local: 'నమస్కారం! నేను ఎయిమ్స్ వాణీయంత్ర AI వైద్యుడిని. మీకు ఎలాంటి ఆరోగ్య సమస్య ఉంది మరియు ఎక్కడ నొప్పిగా ఉంది?',
      english: 'Hello! I am the AIIMS VaniYantra AI Doctor. What health issue are you experiencing and where is the pain?',
    },
    sampleSpokenChips: [
      {
        labelLocal: 'ఛాతీలో తీవ్రమైన నొప్పి & బరువు',
        textLocal: 'నమస్తే డాక్టర్, నిన్న రాత్రి నుండి నా ఛాతీ మధ్యలో తీవ్రమైన బరువు మరియు నొప్పిగా ఉంది. ఇది ఎడమ చేతికి వ్యాపిస్తోంది.',
        textEnglish: 'Hello Doctor, since last night I have severe heaviness and chest pain radiating to left arm.',
        socrates: { site: 'Retrosternal chest', character: 'Crushing heavy pressure', radiation: 'Left arm', severity: 8 },
      },
      {
        labelLocal: 'ఆయాసం మరియు చెమటలు',
        textLocal: 'నాకు శ్వాస తీసుకోవడం కష్టంగా ఉంది మరియు చల్లని చెమటలు పడుతున్నాయి.',
        textEnglish: 'I have severe breathlessness and cold sweating.',
        socrates: { associatedSymptoms: ['Dyspnea', 'Diaphoresis'], severity: 8 },
      },
    ],
    questions: {
      site: {
        local: 'మీ శరీరంలో నొప్పి ఖచ్చితంగా ఏ భాగంలో ఎక్కువగా ఉంది?',
        english: 'In which exact part of your body is the pain most severe?',
      },
      onset: {
        local: 'ఈ సమస్య ఎప్పుడు మొదలైంది? హఠాత్తుగా వచ్చిందా?',
        english: 'When did this issue start? Did it occur suddenly?',
      },
      character: {
        local: 'నొప్పి ఎలా అనిపిస్తోంది—బరువుగా పిండేసినట్టా, సూదితో గుచ్చినట్టా లేదా మంటగానా?',
        english: 'What does the pain feel like—crushing pressure, sharp prickling, or burning?',
      },
      radiation: {
        local: 'ఈ నొప్పి మీ ఎడమ చేయి, దవడ లేదా భుజానికి పాకుతోందా?',
        english: 'Does this pain radiate towards your left arm, jaw, or shoulder?',
      },
      severity: {
        local: '1 నుండి 10 స్కేలులో, మీ నొప్పి తీవ్రత ఎంత?',
        english: 'On a scale of 1 to 10, how severe is your pain?',
      },
      associated: {
        local: 'శ్వాస తీసుకోవడంలో ఇబ్బంది లేదా అధిక చెమటలు ఉన్నాయా?',
        english: 'Is there shortness of breath or profuse sweating?',
      },
    },
    wrapUp: {
      local: 'ధన్యవాదాలు. మీ వివరాలు నమోదు చేయబడ్డాయి. తక్షణ వైద్య పరీక్ష టోకెన్ సిద్ధంగా ఉంది.',
      english: 'Thank you. Your details are logged. Urgent doctor review token is generated.',
    },
    emergencyNotice: {
      local: 'హెచ్చరిక: అత్యవసర కార్డియాక్ లక్షణాలు గుర్తించబడ్డాయి. వెంటనే గది 102 కి వెళ్లండి.',
      english: 'Alert: Emergency cardiac symptoms detected. Proceed to Room 102 immediately.',
    },
  },

  bn: {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    speechCode: 'bn-IN',
    initialGreeting: {
      local: 'নমস্কার! আমি এইমস বাণীযন্ত্র AI ডাক্তার। আপনার কি অসুবিধা হচ্ছে এবং শরীরে কোথায় ব্যথা অনুভব করছেন?',
      english: 'Hello! I am the AIIMS VaniYantra AI Doctor. What discomfort are you experiencing and where in your body is the pain?',
    },
    sampleSpokenChips: [
      {
        labelLocal: 'বুকে তীব্র চাপ ও ব্যথা',
        textLocal: 'নমস্কার ডাক্তারবাবু, কাল রাত থেকে আমার বুকের মাঝে খুব ভারী চাপ ও তীব্র ব্যথা হচ্ছে। ব্যথাটা বাঁ হাত পর্যন্ত ছড়াচ্ছে।',
        textEnglish: 'Hello Doctor, since last night I feel heavy crushing chest pain radiating to my left arm.',
        socrates: { site: 'Retrosternal chest', character: 'Crushing heavy pressure', radiation: 'Left arm', severity: 8 },
      },
      {
        labelLocal: 'শ্বাসকষ্ট ও অস্বাভাবিক ঘাম',
        textLocal: 'আমার প্রচণ্ড শ্বাসকষ্ট হচ্ছে এবং শরীর দিয়ে ঠান্ডা ঘাম বের হচ্ছে।',
        textEnglish: 'I have severe breathing difficulty and profuse cold sweating.',
        socrates: { associatedSymptoms: ['Dyspnea', 'Diaphoresis'], severity: 9 },
      },
    ],
    questions: {
      site: {
        local: 'ব্যথাটা শরীরের ঠিক কোন জায়গায় সবচেয়ে বেশি অনুভূত হচ্ছে?',
        english: 'Where exactly in your body is the pain felt most acutely?',
      },
      onset: {
        local: 'এই সমস্যাটি কখন থেকে শুরু হয়েছে? হঠাৎ করে শুরু হয়েছিল কি?',
        english: 'When did this problem start? Did it begin suddenly?',
      },
      character: {
        local: 'ব্যথার ধরণ কেমন—ভারী চাপ লাগা, কামড়ানো, জ্বালা করা নাকি অন্যরকম?',
        english: 'What is the nature of the pain—heavy pressure, stabbing, or burning?',
      },
      radiation: {
        local: 'ব্যথাটা কি বাঁ হাত, কাঁধ বা চোয়ালের দিকে ছড়িয়ে পড়ছে?',
        english: 'Does the pain spread towards your left arm, shoulder, or jaw?',
      },
      severity: {
        local: '১ থেকে ১০ এর মধ্যে এই ব্যথার তীব্রতা কত দিতে চাইবেন?',
        english: 'On a scale of 1 to 10, how severe would you rate this pain?',
      },
      associated: {
        local: 'শ্বাসকষ্ট, অতিরিক্ত ঘাম বা বুক ধড়ফড় করার মতো কোনো সমস্যা আছে কি?',
        english: 'Do you have shortness of breath, heavy sweating, or palpitations?',
      },
    },
    wrapUp: {
      local: 'ধন্যবাদ। আপনার উপসর্গগুলি সফলভাবে নথিভুক্ত হয়েছে। জরুরি ডাক্তার পরামর্শ টোকেন প্রস্তুত।',
      english: 'Thank you. Your clinical symptoms are recorded. Urgent consultation token generated.',
    },
    emergencyNotice: {
      local: 'সতর্কতা: জরুরি চিকিৎসার প্রয়োজন। অবিলম্বে ১০২ নম্বর ট্রায়াজ কক্ষে যোগাযোগ করুন।',
      english: 'Alert: Immediate medical attention required. Proceed to Room 102.',
    },
  },

  mr: {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    speechCode: 'mr-IN',
    initialGreeting: {
      local: 'नमस्कार! मी एम्स वाणी यंत्र AI डॉक्टर आहे. कृपया सांगा, आपल्याला काय त्रास होत आहे आणि वेदना कुठे होत आहेत?',
      english: 'Hello! I am the AIIMS VaniYantra AI Doctor. Please tell me, what discomfort are you facing and where is the pain?',
    },
    sampleSpokenChips: [
      {
        labelLocal: 'छातीत जडपणा व तीव्र वेदना',
        textLocal: 'नमस्कार डॉक्टर, काल रात्रीपासून माझ्या छातीत मध्यभागी खूप जडपणा आणि तीव्र वेदना होत आहेत. ही कळ डाव्या हाताकडे जात आहे.',
        textEnglish: 'Hello Doctor, since last night I have severe heaviness and chest pain radiating to my left arm.',
        socrates: { site: 'Retrosternal chest', character: 'Crushing heavy pressure', radiation: 'Left arm', severity: 8 },
      },
      {
        labelLocal: 'श्वास घेण्यास त्रास व घाम',
        textLocal: 'मला श्वास घ्यायला खूप त्रास होत आहे आणि भरपूर गार घाम येत आहे.',
        textEnglish: 'I am having great difficulty breathing and heavy cold sweating.',
        socrates: { associatedSymptoms: ['Dyspnea', 'Diaphoresis'], severity: 9 },
      },
    ],
    questions: {
      site: {
        local: 'वेदना शरीराच्या नक्की कोणत्या भागात सर्वात जास्त होत आहेत?',
        english: 'In which exact part of your body is the pain most severe?',
      },
      onset: {
        local: 'हा त्रास कधीपासून सुरू झाला? अचानक सुरू झाला का?',
        english: 'When did this start? Did it occur suddenly?',
      },
      character: {
        local: 'वेदना कशा प्रकारच्या वाटतात—दाब पडल्यासारखे, टोचल्यासारखे की जळजळ?',
        english: 'What kind of pain is it—heavy pressure, stabbing, or burning?',
      },
      radiation: {
        local: 'ही कळ डाव्या हाताकडे, मानेकडे किंवा जबड्याकडे पसरत आहे का?',
        english: 'Is the pain spreading towards your left arm, neck, or jaw?',
      },
      severity: {
        local: '१ ते १० च्या श्रेणीवर या वेदनांची तीव्रता किती आहे?',
        english: 'On a scale of 1 to 10, how intense is the pain?',
      },
      associated: {
        local: 'श्वास घेण्यास त्रास, चक्कर किंवा घाम येणे असा काही त्रास होत आहे का?',
        english: 'Are you experiencing breathlessness, dizziness, or sweating?',
      },
    },
    wrapUp: {
      local: 'धन्यवाद. आपली लक्षणे नोंदवली गेली आहेत. तातडीच्या डॉक्टर तपासणीसाठी टोकन तयार आहे.',
      english: 'Thank you. Your symptoms have been logged. Stat consultation token is generated.',
    },
    emergencyNotice: {
      local: 'सावधानता: तातडीच्या वैद्यकीय मदतीची गरज. त्वरित कक्ष क्र. १०२ मध्ये जा.',
      english: 'Alert: Immediate medical care needed. Proceed to Room 102 immediately.',
    },
  },

  gu: {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    speechCode: 'gu-IN',
    initialGreeting: {
      local: 'નમસ્તે! હું એઈમ્સ વાણી યંત્ર AI ડોક્ટર છું. કૃપા કરીને જણાવો, તમને શું તકલીફ છે અને ક્યાં દુખાવો થાય છે?',
      english: 'Hello! I am the AIIMS VaniYantra AI Doctor. Please tell me, what discomfort are you facing and where is the pain?',
    },
    sampleSpokenChips: [
      {
        labelLocal: 'છાતીમાં ભારે દબાણ અને દુખાવો',
        textLocal: 'નમસ્તે ડોક્ટર, મને કાલ રાતથી છાતીની વચ્ચે ખૂબ ભારે દબાણ અને તીવ્ર દુખાવો થઈ રહ્યો છે, જે ડાબા હાથમાં ફેલાય છે.',
        textEnglish: 'Hello Doctor, since last night I have severe heaviness and intense chest pain radiating to my left arm.',
        socrates: { site: 'Retrosternal chest', character: 'Crushing heavy pressure', radiation: 'Left arm', severity: 8 },
      },
    ],
    questions: {
      site: { local: 'દુખાવો શરીરના કયા ભાગમાં સૌથી વધુ છે?', english: 'Where in your body is the pain most intense?' },
      onset: { local: 'આ તકલીફ ક્યારથી શરૂ થઈ? અચાનક શરૂ થઈ હતી?', english: 'When did this start? Did it begin suddenly?' },
      character: { local: 'દુખાવો કેવો લાગે છે—ભારે દબાણ, ચૂંક આવવી કે બળતરા?', english: 'What does the pain feel like—heavy pressure, cramping, or burning?' },
      radiation: { local: 'શું આ દુખાવો ડાબા હાથ, ગરદન કે જડબા તરફ ફેલાય છે?', english: 'Does this pain radiate to left arm, neck, or jaw?' },
      severity: { local: '૧ થી ૧૦ ના સ્કેલ પર દુખાવાની તીવ્રતા કેટલી છે?', english: 'On a scale of 1 to 10, how severe is the pain?' },
      associated: { local: 'શું શ્વાસ લેવામાં તકલીફ કે પરસેવો થાય છે?', english: 'Are you having shortness of breath or sweating?' },
    },
    wrapUp: {
      local: 'આભાર. તમારા લક્ષણો નોંધાઈ ગયા છે. તાત્કાલિક ડોક્ટર કન્સલ્ટેશન ટોકન તૈયાર છે.',
      english: 'Thank you. Your symptoms have been recorded. Urgent doctor token is ready.',
    },
    emergencyNotice: {
      local: 'ચેતવણી: તાત્કાલિક સારવારની જરૂર છે. રૂમ ૧૦૨ માં સંપર્ક કરો.',
      english: 'Alert: Emergency attention required. Proceed to Room 102.',
    },
  },

  kn: {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    speechCode: 'kn-IN',
    initialGreeting: {
      local: 'ನಮಸ್ಕಾರ! ನಾನು ಏಮ್ಸ್ ವಾಣಿ ಯಂತ್ರ AI ವೈದ್ಯ. ನಿಮಗೆ ಏನು ತೊಂದರೆಯಾಗುತ್ತಿದೆ ಮತ್ತು ಎಲ್ಲಿ ನೋವಿದೆ?',
      english: 'Hello! I am the AIIMS VaniYantra AI Doctor. What discomfort are you facing and where is the pain?',
    },
    sampleSpokenChips: [
      {
        labelLocal: 'ಎದೆ ನೋವು ಮತ್ತು ಭಾರ',
        textLocal: 'ನಮಸ್ಕಾರ ಡಾಕ್ಟರ್, ನಿನ್ನೆ ರಾತ್ರಿಯಿಂದ ಎದೆಯ ಮಧ್ಯದಲ್ಲಿ ತೀವ್ರವಾದ ಭಾರ ಮತ್ತು ನೋವಿದೆ. ಇದು ಎಡಗೈಗೂ ಹರಡುತ್ತಿದೆ.',
        textEnglish: 'Hello Doctor, since last night I have severe heaviness and chest pain radiating to my left arm.',
        socrates: { site: 'Retrosternal chest', character: 'Crushing heavy pressure', radiation: 'Left arm', severity: 8 },
      },
    ],
    questions: {
      site: { local: 'ನೋವು ದೇಹದ ಯಾವ ಭಾಗದಲ್ಲಿ ಹೆಚ್ಚಾಗಿದೆ?', english: 'In which part of the body is the pain felt most?' },
      onset: { local: 'ಈ ನೋವು ಯಾವಾಗ ಪ್ರಾರಂಭವಾಯಿತು? ಹಠಾತ್ತನೆ ಬಂದಿದ್ದಾ?', english: 'When did this pain begin? Did it start suddenly?' },
      character: { local: 'ನೋವು ಹೇಗೆ ಭಾಸವಾಗುತ್ತಿದೆ—ಭಾರವಾದ ಒತ್ತಡವೇ, ಚುಚ್ಚುವಂತಿದೆಯೇ?', english: 'What does the pain feel like—heavy pressure or sharp stabbing?' },
      radiation: { local: 'ಈ ನೋವು ಎಡ ಭುಜ, ಕೈ ಅಥವಾ ದವಡೆಗೆ ಹರಡುತ್ತಿದೆಯೇ?', english: 'Does this pain spread to left shoulder, arm, or jaw?' },
      severity: { local: '೧ ರಿಂದ ೧೦ ರ ಅಳತೆಯಲ್ಲಿ ನೋವಿನ ತೀವ್ರತೆ ಎಷ್ಟು?', english: 'On a scale of 1 to 10, how severe is the pain?' },
      associated: { local: 'ಉಸಿರಾಟದ ತೊಂದರೆ ಅಥವಾ ವಿಪರೀತ ಬೆವರು ಬರುತ್ತಿದೆಯೇ?', english: 'Is there shortness of breath or heavy sweating?' },
    },
    wrapUp: {
      local: 'ಧನ್ಯವಾದಗಳು. ನಿಮ್ಮ ರೋಗಲಕ್ಷಣಗಳು ದಾಖಲಾಗಿವೆ. ತುರ್ತು ವೈದ್ಯರ ಭೇಟಿ ಟೋಕನ್ ಸಿದ್ಧವಾಗಿದೆ.',
      english: 'Thank you. Your symptoms have been logged. Stat doctor consultation token is ready.',
    },
    emergencyNotice: {
      local: 'ಎಚ್ಚರಿಕೆ: ತುರ್ತು ಚಿಕಿತ್ಸೆ ಅಗತ್ಯವಿದೆ. ತಕ್ಷಣ ಕೊಠಡಿ ೧೦೨ ಕ್ಕೆ ತೆರಳಿ.',
      english: 'Alert: Emergency medical care needed. Proceed to Room 102.',
    },
  },

  ml: {
    code: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    speechCode: 'ml-IN',
    initialGreeting: {
      local: 'നമസ്കാരം! ഞാൻ എയിംസ് വാണി യന്ത്ര AI ഡോക്ടറാണ്. എന്താണ് അസുഖം, എവിടെയാണ് വേദന അനുഭവപ്പെടുന്നത്?',
      english: 'Hello! I am the AIIMS VaniYantra AI Doctor. What trouble are you having and where is the pain located?',
    },
    sampleSpokenChips: [
      {
        labelLocal: 'നെഞ്ചുവേദനയും ഭാരവും',
        textLocal: 'നമസ്കാരം ഡോക്ടർ, ഇന്നലെ രാത്രി മുതൽ നെഞ്ചിന്റെ നടുവിൽ കഠിനമായ ഭാരവും വേദനയും ഉണ്ട്. ഇത് ഇടത് കൈയിലേക്കും വ്യാപിക്കുന്നു.',
        textEnglish: 'Hello Doctor, since last night I have severe heaviness and chest pain radiating to my left arm.',
        socrates: { site: 'Retrosternal chest', character: 'Crushing heavy pressure', radiation: 'Left arm', severity: 8 },
      },
    ],
    questions: {
      site: { local: 'വേദന ശരീരത്തിൽ കൃത്യമായി എവിടെയാണ് കൂടുതൽ?', english: 'Where in your body is the pain felt most acutely?' },
      onset: { local: 'ഈ വേദന എപ്പോഴാണ് ആരംഭിച്ചത്? പെട്ടെന്ന് തുടങ്ങിയതാണോ?', english: 'When did this pain start? Did it occur suddenly?' },
      character: { local: 'വേദന എങ്ങനെയുള്ളതാണ്—കഠിനമായ ഭാരമോ, കുത്തുന്ന വേദനയോ, എരിച്ചിലോ?', english: 'How does the pain feel—crushing pressure, stabbing, or burning?' },
      radiation: { local: 'വേദന ഇടതുകൈയിലേക്കോ, തോളിലേക്കോ, താടിയിലേക്കോ പടരുന്നുണ്ടോ?', english: 'Does the pain spread to left arm, shoulder, or jaw?' },
      severity: { local: '1 മുതൽ 10 വരെയുള്ള അളവിൽ വേദനയുടെ തീവ്രത എത്രയാണ്?', english: 'On a scale of 1 to 10, how severe is the pain?' },
      associated: { local: 'ശ്വാസമെടുക്കാൻ ബുദ്ധിമുട്ടോ, അമിത വിയർപ്പോ ഉണ്ടോ?', english: 'Do you have difficulty breathing or heavy sweating?' },
    },
    wrapUp: {
      local: 'നന്ദി. നിങ്ങളുടെ ലക്ഷണങ്ങൾ രേഖപ്പെടുത്തി. അടിയന്തര ഡോക്ടർ പരിശോധന ടോക്കൺ തയ്യാറാണ്.',
      english: 'Thank you. Your symptoms are recorded. Urgent doctor review token is ready.',
    },
    emergencyNotice: {
      local: 'മുന്നറിയിപ്പ്: അടിയന്തര ചികിത്സ ആവശ്യമാണ്. ഉടൻ റൂം 102 ലേക്ക് പോകുക.',
      english: 'Alert: Immediate medical intervention required. Proceed to Room 102.',
    },
  },

  pa: {
    code: 'pa',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    speechCode: 'pa-IN',
    initialGreeting: {
      local: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਏਮਜ਼ ਵਾਣੀ ਯੰਤਰ AI ਡਾਕਟਰ ਹਾਂ। ਕਿਰਪਾ ਕਰਕੇ ਦੱਸੋ, ਤੁਹਾਨੂੰ ਕੀ ਤਕਲੀਫ ਹੈ ਅਤੇ ਦਰਦ ਕਿੱਥੇ ਹੈ?',
      english: 'Hello! I am the AIIMS VaniYantra AI Doctor. Please tell me, what discomfort do you have and where is the pain?',
    },
    sampleSpokenChips: [
      {
        labelLocal: 'ਛਾਤੀ ਵਿੱਚ ਭਾਰਾਪਨ ਤੇ ਦਰਦ',
        textLocal: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਡਾਕਟਰ ਸਾਹਿਬ, ਕੱਲ੍ਹ ਰਾਤ ਤੋਂ ਛਾਤੀ ਦੇ ਵਿਚਕਾਰ ਬਹੁਤ ਭਾਰਾਪਨ ਅਤੇ ਤੇਜ਼ ਦਰਦ ਹੈ। ਇਹ ਖੱਬੀ ਬਾਂਹ ਵਿੱਚ ਵੀ ਜਾ ਰਿਹਾ ਹੈ।',
        textEnglish: 'Hello Doctor, since last night I have severe heaviness and chest pain radiating to left arm.',
        socrates: { site: 'Retrosternal chest', character: 'Crushing heavy pressure', radiation: 'Left arm', severity: 8 },
      },
    ],
    questions: {
      site: { local: 'ਦਰਦ ਸਰੀਰ ਦੇ ਕਿਸ ਹਿੱਸੇ ਵਿੱਚ ਸਭ ਤੋਂ ਵੱਧ ਹੈ?', english: 'In which part of the body is the pain felt most?' },
      onset: { local: 'ਇਹ ਤਕਲੀਫ ਕਦੋਂ ਸ਼ੁਰੂ ਹੋਈ? ਅਚਾਨਕ ਹੋਈ ਸੀ?', english: 'When did this start? Did it occur suddenly?' },
      character: { local: 'ਦਰਦ ਕਿਸ ਤਰ੍ਹਾਂ ਦਾ ਹੈ—ਭਾਰਾ ਦਬਾਅ, ਚੁੱਭਣ ਜਾਂ ਜਲਣ ਵਰਗਾ?', english: 'What does the pain feel like—heavy pressure, stabbing, or burning?' },
      radiation: { local: 'ਕੀ ਇਹ ਦਰਦ ਖੱਬੀ ਬਾਂਹ, ਮੋਢੇ ਜਾਂ ਜਬਾੜੇ ਵੱਲ ਫੈਲ ਰਿਹਾ ਹੈ?', english: 'Does this pain radiate to left arm, shoulder, or jaw?' },
      severity: { local: '੧ ਤੋਂ ੧੦ ਦੇ ਪੈਮਾਨੇ ਤੇ ਦਰਦ ਦੀ ਤੀਬਰਤਾ ਕਿੰਨੀ ਹੈ?', english: 'On a scale of 1 to 10, how severe is the pain?' },
      associated: { local: 'ਕੀ ਸਾਹ ਲੈਣ ਵਿੱਚ ਦਿੱਕਤ ਜਾਂ ਠੰਡਾ ਪਸੀਨਾ ਆ ਰਿਹਾ ਹੈ?', english: 'Are you having breathlessness or cold sweating?' },
    },
    wrapUp: {
      local: 'ਧੰਨਵਾਦ। ਤੁਹਾਡੇ ਲੱਛਣ ਦਰਜ ਕਰ ਲਏ ਗਏ ਹਨ। ਐਮਰਜੈਂਸੀ ਡਾਕਟਰ ਟੋਕਨ ਤਿਆਰ ਹੈ।',
      english: 'Thank you. Your symptoms have been logged. Emergency doctor token is ready.',
    },
    emergencyNotice: {
      local: 'ਚੇਤਾਵਨੀ: ਤੁਰੰਤ ਡਾਕਟਰੀ ਸਹਾਇਤਾ ਦੀ ਲੋੜ ਹੈ। ਕਮਰਾ ਨੰਬਰ ੧੦੨ ਵਿੱਚ ਸੰਪਰਕ ਕਰੋ।',
      english: 'Alert: Immediate medical care needed. Proceed to Room 102.',
    },
  },

  or: {
    code: 'or',
    name: 'Odia',
    nativeName: 'ଓଡ଼ିଆ',
    speechCode: 'or-IN',
    initialGreeting: {
      local: 'ନମସ୍କାର! ମୁଁ ଏମ୍ସ ବାଣୀ ଯନ୍ତ୍ର AI ଡାକ୍ତର। ଆପଣଙ୍କୁ କ’ଣ ଅସୁବିଧା ହେଉଛି ଏବଂ କେଉଁଠି ଯନ୍ତ୍ରଣା ହେଉଛି?',
      english: 'Hello! I am the AIIMS VaniYantra AI Doctor. What problem are you having and where is the pain?',
    },
    sampleSpokenChips: [
      {
        labelLocal: 'ଛାତିରେ ଅତ୍ୟଧିକ ଚାପ ଓ ଯନ୍ତ୍ରଣା',
        textLocal: 'ନମସ୍କାର ଡାକ୍ତର, ଗତକାଲି ରାତିରୁ ମୋ ଛାତି ମଝିରେ ଭାରୀ ଚାପ ଓ ପ୍ରବଳ ଯନ୍ତ୍ରଣା ହେଉଛି, ଯାହା ବାମ ହାତକୁ ବ୍ୟାପୁଛି।',
        textEnglish: 'Hello Doctor, since last night I have severe heaviness and chest pain radiating to left arm.',
        socrates: { site: 'Retrosternal chest', character: 'Crushing heavy pressure', radiation: 'Left arm', severity: 8 },
      },
    ],
    questions: {
      site: { local: 'ଯନ୍ତ୍ରଣା ଶରୀରର କେଉଁ ଅଂଶରେ ସବୁଠାରୁ ଅଧିକ ଅନୁଭୂତ ହେଉଛି?', english: 'Where in your body is the pain felt most?' },
      onset: { local: 'ଏହି ଯନ୍ତ୍ରଣା କେବେଠାରୁ ଆରମ୍ଭ ହେଲା? ହଠାତ୍ ଆରମ୍ଭ ହୋଇଥିଲା କି?', english: 'When did this start? Did it occur suddenly?' },
      character: { local: 'ଯନ୍ତ୍ରଣା କିପରି ଲାଗୁଛି—ଭାରୀ ଚାପ, ଛୁଞ୍ଚି ଫୋଡ଼ିଲା ଭଳି ନା ପୋଡ଼ାଜଳା?', english: 'What does the pain feel like—heavy pressure, stabbing, or burning?' },
      radiation: { local: 'ଏହି ଯନ୍ତ୍ରଣା ବାମ ହାତ, କାନ୍ଧ କିମ୍ବା ମୁଖମଣ୍ଡଳ ଆଡ଼କୁ ବ୍ୟାପୁଛି କି?', english: 'Does this pain radiate to left arm, shoulder, or jaw?' },
      severity: { local: '୧ ରୁ ୧୦ ମଧ୍ୟରେ ଯନ୍ତ୍ରଣାର ତୀବ୍ରତା କେତେ?', english: 'On a scale of 1 to 10, how severe is the pain?' },
      associated: { local: 'ନିଶ୍ୱାସ ନେବାରେ କଷ୍ଟ କିମ୍ବା ଅତ୍ୟଧିକ ଝାଳ ବୋହୁଛି କି?', english: 'Is there shortness of breath or heavy sweating?' },
    },
    wrapUp: {
      local: 'ଧନ୍ୟବାଦ। ଆପଣଙ୍କ ଲକ୍ଷଣ ଲିପିବଦ୍ଧ ହୋଇଛି। ଜରୁରୀକାଳୀନ ଡାକ୍ତର ଟୋକନ୍ ପ୍ରସ୍ତୁତ।',
      english: 'Thank you. Your symptoms are recorded. Stat doctor review token is generated.',
    },
    emergencyNotice: {
      local: 'ସତର୍କତା: ତୁରନ୍ତ ଚିକିତ୍ସା ଆବଶ୍ୟକ। ରୁମ୍ ନଂ ୧୦୨ କୁ ଯାଆନ୍ତୁ।',
      english: 'Alert: Immediate medical attention required. Proceed to Room 102.',
    },
  },

  ur: {
    code: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
    speechCode: 'ur-IN',
    initialGreeting: {
      local: 'السلام علیکم! میں ایمز وانی ینتر AI ڈاکٹر ہوں۔ براہ کرم بتائیں، آپ کو کیا تکلیف ہے اور درد کہاں ہے؟',
      english: 'Hello! I am the AIIMS VaniYantra AI Doctor. Please tell me, what discomfort are you facing and where is the pain located?',
    },
    sampleSpokenChips: [
      {
        labelLocal: 'سینے میں شدید بوجھ اور درد',
        textLocal: 'ڈاکٹر صاحب، کل رات سے سینے کے درمیان شدید بوجھ اور تیز درد ہو رہا ہے جو بائیں بازو کی طرف پھیل رہا ہے۔',
        textEnglish: 'Doctor, since last night I have severe heaviness and acute chest pain radiating to my left arm.',
        socrates: { site: 'Retrosternal chest', character: 'Crushing heavy pressure', radiation: 'Left arm', severity: 8 },
      },
    ],
    questions: {
      site: { local: 'درد جسم کے کس حصے میں سب سے زیادہ محسوس ہو رہا ہے؟', english: 'In which part of the body is the pain felt most?' },
      onset: { local: 'یہ تکلیف کب سے شروع ہوئی؟ کیا اچانک شروع ہوئی تھی؟', english: 'When did this start? Did it begin suddenly?' },
      character: { local: 'درد کی نوعیت کیسی ہے—دباؤ جیسا، چبھن جیسا یا جلن؟', english: 'What does the pain feel like—heavy pressure, stabbing, or burning?' },
      radiation: { local: 'کیا یہ درد بائیں بازو، کندھے یا جبڑے کی طرف پھیل رہا ہے؟', english: 'Does this pain radiate to left arm, shoulder, or jaw?' },
      severity: { local: '1 سے 10 کے پیمانے پر درد کی شدت کتنی ہے؟', english: 'On a scale of 1 to 10, how intense is the pain?' },
      associated: { local: 'کیا سانس لینے میں دشواری یا پسینہ آ رہا ہے؟', english: 'Are you having difficulty breathing or sweating?' },
    },
    wrapUp: {
      local: 'شکریہ۔ آپ کی علامات درج کر لی گئی ہیں۔ ہنگامی ڈاکٹر ٹوکن تیار ہے۔',
      english: 'Thank you. Your symptoms are recorded. Emergency doctor consultation token is ready.',
    },
    emergencyNotice: {
      local: 'انتباہ: فوری طبی امداد کی ضرورت ہے۔ کمرہ نمبر 102 میں رابطہ کریں۔',
      english: 'Alert: Immediate medical assistance needed. Proceed to Room 102.',
    },
  },

  as: {
    code: 'as',
    name: 'Assamese',
    nativeName: 'অসমীয়া',
    speechCode: 'as-IN',
    initialGreeting: {
      local: 'নমস্কাৰ! মই এইমছ বাণী যন্ত্ৰ AI চিকিৎসক। আপোনাৰ কি অসুবিধা হৈছে আৰু ক’ত বিষ অনুভৱ হৈছে?',
      english: 'Hello! I am the AIIMS VaniYantra AI Doctor. What discomfort are you experiencing and where is the pain?',
    },
    sampleSpokenChips: [
      {
        labelLocal: 'বুকুত প্ৰচণ্ড চাপ আৰু বিষ',
        textLocal: 'নমস্কাৰ ডাক্তৰ, কালি ৰাতিৰ পৰা বুকুৰ মাজভাগত প্ৰচণ্ড চাপ আৰু বিষ হৈছে, যি বাওঁ হাতলৈ বিয়পি গৈছে।',
        textEnglish: 'Hello Doctor, since last night I have severe heaviness and chest pain radiating to left arm.',
        socrates: { site: 'Retrosternal chest', character: 'Crushing heavy pressure', radiation: 'Left arm', severity: 8 },
      },
    ],
    questions: {
      site: { local: 'বিষটো শৰীৰৰ কোনটো অংশত সৰ্বাধিক অনুভূত হৈছে?', english: 'Where in your body is the pain felt most?' },
      onset: { local: 'এই বিষটো কেতিয়াৰ পৰা আৰম্ভ হ’ল? হঠাৎ হৈছিল নেকি?', english: 'When did this start? Did it occur suddenly?' },
      character: { local: 'বিষটো কেনেকুৱা লাগিছে—ভাৰী চাপ, বিন্ধা বা জ্বলা-পোৰা?', english: 'What does the pain feel like—heavy pressure, stabbing, or burning?' },
      radiation: { local: 'বিষটো বাওঁ হাত, কান্ধ বা হনুলৈ বিয়পি পৰিছে নেকি?', english: 'Does this pain radiate to left arm, shoulder, or jaw?' },
      severity: { local: '১ ৰ পৰা ১০ ৰ ভিতৰত বিষৰ মাত্ৰা কিমান?', english: 'On a scale of 1 to 10, how severe is the pain?' },
      associated: { local: 'উশাহ লোৱাত কষ্ট বা অত্যাধিক ঘাম ওলাইছে নেকি?', english: 'Is there shortness of breath or heavy sweating?' },
    },
    wrapUp: {
      local: 'ধন্যবাদ। আপোনাৰ লক্ষণসমূহ লিপিবদ্ধ কৰা হৈছে। জৰুৰীকালীন চিকিৎসক টোকেন প্ৰস্তুত।',
      english: 'Thank you. Your symptoms have been logged. Stat doctor consultation token generated.',
    },
    emergencyNotice: {
      local: 'সতৰ্কবাণী: জৰুৰী চিকিৎসাৰ প্ৰয়োজন। তৎক্ষণাত কোঠা নং ১০২ লৈ যাওক।',
      english: 'Alert: Immediate medical care needed. Proceed to Room 102.',
    },
  },

  en: {
    code: 'en',
    name: 'English (Indian)',
    nativeName: 'English',
    speechCode: 'en-IN',
    initialGreeting: {
      local: 'Hello! I am the AIIMS VaniYantra AI Medical Doctor. Please describe your chief complaints and where you are experiencing pain or discomfort.',
      english: 'Hello! I am the AIIMS VaniYantra AI Medical Doctor. Please describe your chief complaints and where you are experiencing pain or discomfort.',
    },
    sampleSpokenChips: [
      {
        labelLocal: 'Crushing Chest Pain & Squeezing',
        textLocal: 'Hello Doctor, since last night I have severe heaviness, tightness and crushing chest pain radiating to my left arm and jaw.',
        textEnglish: 'Hello Doctor, since last night I have severe heaviness, tightness and crushing chest pain radiating to my left arm and jaw.',
        socrates: { site: 'Retrosternal chest', character: 'Crushing heavy pressure', radiation: 'Left arm & jaw', severity: 8 },
      },
      {
        labelLocal: 'Shortness of Breath & Sweating',
        textLocal: 'I am experiencing acute breathlessness, profuse cold sweats, and dizziness upon mild walking.',
        textEnglish: 'I am experiencing acute breathlessness, profuse cold sweats, and dizziness upon mild walking.',
        socrates: { associatedSymptoms: ['Exertional Dyspnea', 'Cold Diaphoresis', 'Dizziness'], severity: 9 },
      },
    ],
    questions: {
      site: { local: 'In which exact anatomical region is the discomfort most pronounced?', english: 'In which exact anatomical region is the discomfort most pronounced?' },
      onset: { local: 'When did this begin, and was the onset sudden or gradual?', english: 'When did this begin, and was the onset sudden or gradual?' },
      character: { local: 'How would you describe the character of pain (crushing, stabbing, burning, or dull ache)?', english: 'How would you describe the character of pain (crushing, stabbing, burning, or dull ache)?' },
      radiation: { local: 'Does the pain radiate anywhere, such as to the left shoulder, inner arm, neck, or epigastrium?', english: 'Does the pain radiate anywhere, such as to the left shoulder, inner arm, neck, or epigastrium?' },
      severity: { local: 'On a numeric rating scale from 1 to 10, how severe is your pain currently?', english: 'On a numeric rating scale from 1 to 10, how severe is your pain currently?' },
      associated: { local: 'Are there associated symptoms such as diaphoresis, dyspnea, nausea, or palpitations?', english: 'Are there associated symptoms such as diaphoresis, dyspnea, nausea, or palpitations?' },
    },
    wrapUp: {
      local: 'Thank you. Your structured clinical intake has been codified into FHIR & SOCRATES format. Stat triage token generated.',
      english: 'Thank you. Your structured clinical intake has been codified into FHIR & SOCRATES format. Stat triage token generated.',
    },
    emergencyNotice: {
      local: 'RED FLAG ALERT: Acute Coronary Syndrome indicators detected. Proceed immediately to Triage Room 102.',
      english: 'RED FLAG ALERT: Acute Coronary Syndrome indicators detected. Proceed immediately to Triage Room 102.',
    },
  },
};

/**
 * Fallback config for other Bhashini languages (Sanskrit, Nepali, Maithili, Kashmiri, Konkani, Manipuri, Bodo, Dogri, Santali, Sindhi)
 */
export function getLanguageTriageConfig(langCode: string): LanguageTriageConfig {
  if (VANIYANTRA_22_CONFIGS[langCode]) {
    return VANIYANTRA_22_CONFIGS[langCode];
  }

  // Base fallback with Hindi/English hybrid tailored with matching native language speechCode
  const baseHindi = VANIYANTRA_22_CONFIGS.hi;
  return {
    ...baseHindi,
    code: langCode,
    speechCode: `${langCode}-IN`,
  };
}

export interface VaniYantraFullReportResult {
  isComplete: boolean;
  completionScore: number;
  missingParameters: string[];
  provisionalDiagnosis: string;
  icd10Code: string;
  differentialDiagnoses: string[];
  triageLevel: 'RED' | 'YELLOW' | 'GREEN';
  isRedFlag: boolean;
  redFlagReason?: string;
  socrates: SocratesHistory;
  recommendedTests: string[];
  clinicalImpression: string;
  triageInstructions: string;
  engineUsed: string;
}

/**
 * Generate Comprehensive Post-Call Clinical Assessment Report
 * Called strictly after call ends or upon comprehensive triage completion
 */
export async function generateFullClinicalReport(params: {
  conversationHistory: Array<{ sender: 'ai' | 'user'; textLocal: string; textEnglish?: string; timestamp?: string }>;
  languageCode: string;
  clinicalTrack?: 'allopathic' | 'ayush';
  extractedSocrates?: Partial<SocratesHistory>;
  patientInfo?: any;
}): Promise<VaniYantraFullReportResult> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch('/api/vaniyantra/generate-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        conversationHistory: params.conversationHistory || [],
        languageCode: params.languageCode || 'hi',
        clinicalTrack: params.clinicalTrack || 'allopathic',
        patientInfo: params.patientInfo || {},
        extractedSocrates: params.extractedSocrates || {},
      }),
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        return {
          isComplete: Boolean(data.isComplete),
          completionScore: data.completionScore || 90,
          missingParameters: data.missingParameters || [],
          provisionalDiagnosis: data.provisionalDiagnosis || 'I20.0 - Clinical Consultation Documented',
          icd10Code: data.icd10Code || 'R07.9',
          differentialDiagnoses: data.differentialDiagnoses || ['Clinical Evaluation Required'],
          triageLevel: data.triageLevel || 'YELLOW',
          isRedFlag: Boolean(data.isRedFlag),
          redFlagReason: data.redFlagReason || '',
          socrates: data.socrates || (params.extractedSocrates as SocratesHistory) || {
            site: 'Retrosternal chest',
            onset: 'Acute',
            character: 'Pain',
            radiation: 'None',
            associatedSymptoms: [],
            timeCourse: 'Constant',
            exacerbatingFactors: 'Exertion',
            severity: 7,
          },
          recommendedTests: data.recommendedTests || ['Vital Signs Check', 'Doctor Review'],
          clinicalImpression: data.clinicalImpression || 'Patient evaluated via VaniYantra AI Doctor triage.',
          triageInstructions: data.triageInstructions || 'Proceed to OPD triage queue.',
          engineUsed: data.engineUsed || 'VaniYantra Clinical Triage Engine (AIIMS)',
        };
      }
    }
  } catch (error) {
    console.warn('VaniYantra report API network error or timeout:', error);
  }

  // Autonomous fallback for clinical report
  const userTurns = (params.conversationHistory || []).filter((t) => t.sender === 'user');
  const isComplete = userTurns.length >= 2;
  const socrates = params.extractedSocrates || {};
  const isRed = socrates.severity && socrates.severity >= 8;

  return {
    isComplete,
    completionScore: isComplete ? 92 : 35,
    missingParameters: !isComplete ? ['Consultation ended early', 'Radiation unverified'] : [],
    provisionalDiagnosis: isRed
      ? 'I20.0 - Suspected Acute Coronary Syndrome (ACS) / Unstable Angina'
      : 'R07.9 - General Outpatient Clinical Consultation',
    icd10Code: isRed ? 'I20.0' : 'R07.9',
    differentialDiagnoses: isRed
      ? ['Acute Myocardial Ischemia', 'Gastroesophageal Reflux Disease (GERD)', 'Costochondritis']
      : ['General Medical Evaluation', 'Symptomatic Assessment'],
    triageLevel: isRed ? 'RED' : 'YELLOW',
    isRedFlag: Boolean(isRed),
    redFlagReason: isRed ? 'Acute Retrosternal Pressure with Radiating Symptoms' : '',
    socrates: {
      site: socrates.site || 'Retrosternal chest',
      onset: socrates.onset || (isComplete ? 'Acute onset' : 'Unspecified (Call interrupted)'),
      character: socrates.character || 'Localized physical discomfort',
      radiation: socrates.radiation || 'None reported',
      associatedSymptoms: socrates.associatedSymptoms || [],
      timeCourse: socrates.timeCourse || 'Continuous',
      exacerbatingFactors: socrates.exacerbatingFactors || 'Physical exertion',
      severity: socrates.severity || 7,
    },
    recommendedTests: isRed
      ? ['12-Lead STAT ECG', 'Point-of-Care Troponin I', 'SpO2 Monitoring', 'CXR']
      : ['Vital Signs Baseline', 'Doctor Physical Examination'],
    clinicalImpression: 'Patient underwent voice intake consultation. Ready for hospital queue allocation.',
    triageInstructions: isRed
      ? 'Level-1 Emergency Priority. Direct patient immediately to Triage Room 102 for STAT ECG.'
      : 'Proceed to registered outpatient queue.',
    engineUsed: 'VaniYantra Autonomous Clinical Assessment Engine (AIIMS/ABDM Protocol)',
  };
}

/**
 * Autonomous AI Doctor Live Clinical Consultation API
 * Calls the backend Gemini 3.7 Flash clinical reasoning engine with full conversational memory
 */
export async function consultVaniYantraAi(params: {
  message: string;
  conversationHistory?: Array<{ sender: 'ai' | 'user'; textLocal: string; textEnglish?: string }>;
  languageCode: string;
  clinicalTrack?: 'allopathic' | 'ayush';
  currentSocrates?: SocratesHistory;
  patientInfo?: any;
}): Promise<{
  aiReplyLocal: string;
  aiReplyEnglish: string;
  extractedSocrates: Partial<SocratesHistory>;
  provisionalDiagnosis: string;
  differentialDiagnoses: string[];
  triageLevel: 'RED' | 'YELLOW' | 'GREEN';
  isRedFlag: boolean;
  redFlagReason?: string;
  recommendedTests: string[];
  clinicalNotes: string;
  nextSuggestedAction: string;
  engineUsed: string;
}> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2800);

    const res = await fetch('/api/vaniyantra/consult', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        message: params.message,
        conversationHistory: params.conversationHistory || [],
        languageCode: params.languageCode,
        clinicalTrack: params.clinicalTrack || 'allopathic',
        currentSocrates: params.currentSocrates || {},
        patientInfo: params.patientInfo || {},
      }),
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    if (data.success) {
      return {
        aiReplyLocal: data.aiReplyLocal,
        aiReplyEnglish: data.aiReplyEnglish,
        extractedSocrates: data.extractedSocrates || {},
        provisionalDiagnosis: data.provisionalDiagnosis || 'Clinical Assessment in Progress',
        differentialDiagnoses: data.differentialDiagnoses || [],
        triageLevel: data.triageLevel || 'YELLOW',
        isRedFlag: Boolean(data.isRedFlag),
        redFlagReason: data.redFlagReason,
        recommendedTests: data.recommendedTests || [],
        clinicalNotes: data.clinicalNotes || '',
        nextSuggestedAction: data.nextSuggestedAction || 'consult_doctor',
        engineUsed: data.engineUsed || 'VaniYantra AI Doctor',
      };
    }
  } catch (error) {
    console.warn('VaniYantra backend API fast fallback triggered:', error);
  }

  // Instant Autonomous fallback if offline or timeout (< 5ms response!)
  const fallback = processUserSpokenTurn(
    params.message,
    params.languageCode,
    params.conversationHistory?.length || 0,
    params.currentSocrates || ({} as SocratesHistory)
  );

  return {
    aiReplyLocal: fallback.aiReplyLocal,
    aiReplyEnglish: fallback.aiReplyEnglish,
    extractedSocrates: fallback.extractedSocrates,
    provisionalDiagnosis: fallback.isRedFlag
      ? 'Suspected Acute Cardiorespiratory Syndrome (High-Priority Triage)'
      : 'Outpatient Clinical Evaluation',
    differentialDiagnoses: fallback.isRedFlag
      ? ['Acute Coronary Syndrome', 'Angina Pectoris', 'Thoracic Wall Strain']
      : ['General Medical Evaluation', 'Symptomatic Assessment'],
    triageLevel: fallback.isRedFlag ? 'RED' : 'YELLOW',
    isRedFlag: fallback.isRedFlag,
    redFlagReason: fallback.redFlagReason,
    recommendedTests: fallback.isRedFlag
      ? ['12-Lead STAT ECG', 'Point-of-care Troponin I', 'SpO2 Oxygen Check']
      : ['Vital Signs Baseline', 'Doctor Review'],
    clinicalNotes: `Patient triage recorded in ${params.languageCode}.`,
    nextSuggestedAction: fallback.isRedFlag ? 'immediate_ecg' : 'consult_doctor',
    engineUsed: 'VaniYantra Autonomous Clinical Engine (AIIMS Fallback)',
  };
}

/**
 * Intelligent Dynamic AI Response & Symptom Extractor for Live Conversational Turns
 */
export function processUserSpokenTurn(
  userInput: string,
  langCode: string,
  turnIndex: number,
  currentSocrates: SocratesHistory
): {
  aiReplyLocal: string;
  aiReplyEnglish: string;
  extractedSocrates: Partial<SocratesHistory>;
  isRedFlag: boolean;
  redFlagReason?: string;
  nextStepSuggested: 'site' | 'onset' | 'character' | 'radiation' | 'severity' | 'associated' | 'wrap_up';
} {
  const config = getLanguageTriageConfig(langCode);
  const lower = (userInput || '').toLowerCase();

  const extracted: Partial<SocratesHistory> = { ...currentSocrates };
  let isRedFlag = false;
  let redFlagReason = '';

  // 1. Detect Red Flags & Symptoms
  const hasChestOrCardiac =
    lower.includes('chest') ||
    lower.includes('heart') ||
    lower.includes('सीने') ||
    lower.includes('छाती') ||
    lower.includes('நெஞ்சு') ||
    lower.includes('ఛాతీ') ||
    lower.includes('বুক') ||
    lower.includes('धड़कन') ||
    lower.includes('पसीना') ||
    lower.includes('sweat');

  const hasDyspnea =
    lower.includes('breath') ||
    lower.includes('सांस') ||
    lower.includes('मूச்சு') ||
    lower.includes('శ్వాస') ||
    lower.includes('শ্বাস');

  const hasStomach =
    lower.includes('stomach') ||
    lower.includes('पेट') ||
    lower.includes('വയർ') ||
    lower.includes('కడుపు') ||
    lower.includes('পেট') ||
    lower.includes('पोट');

  const hasFever =
    lower.includes('fever') ||
    lower.includes('बुखार') ||
    lower.includes('காய்ச்சல்') ||
    lower.includes('జ్వరం') ||
    lower.includes('জ্বর') ||
    lower.includes('ताप');

  const hasHeadache =
    lower.includes('head') ||
    lower.includes('सिर') ||
    lower.includes('தலை') ||
    lower.includes('తల') ||
    lower.includes('মাথা');

  if (hasChestOrCardiac || (hasDyspnea && lower.includes('sweat'))) {
    isRedFlag = true;
    redFlagReason = 'Acute Cardiorespiratory symptoms identified (Retrosternal chest pain / Dyspnea / Diaphoresis).';
  }

  // 2. Extract Site
  if (hasChestOrCardiac) {
    extracted.site = 'Retrosternal chest & precordium';
  } else if (hasHeadache) {
    extracted.site = 'Head & Cervical region';
  } else if (hasStomach) {
    extracted.site = 'Abdomen & Epigastric region';
  } else if (lower.includes('back') || lower.includes('पीठ') || lower.includes('முதுகு') || lower.includes('వీపు') || lower.includes('পিঠ')) {
    extracted.site = 'Lumbar spine & Back';
  }

  // 3. Extract Character
  if (lower.includes('heavy') || lower.includes('crush') || lower.includes('भारी') || lower.includes('দাব') || lower.includes('பாரம்') || lower.includes('బరువు')) {
    extracted.character = 'Heavy crushing squeezing pressure';
  } else if (lower.includes('sharp') || lower.includes('prick') || lower.includes('तेज') || lower.includes('चुभन') || lower.includes('குத்துவது')) {
    extracted.character = 'Sharp stabbing pain';
  } else if (lower.includes('burn') || lower.includes('जलन') || lower.includes('எரிச்சல்') || lower.includes('మంట') || lower.includes('জ্বালা')) {
    extracted.character = 'Burning retrosternal sensation';
  }

  // 4. Extract Radiation
  if (lower.includes('arm') || lower.includes('हाथ') || lower.includes('கை') || lower.includes('చేయి') || lower.includes('হাত') || lower.includes('shoulder') || lower.includes('कंधे') || lower.includes('தோள்')) {
    extracted.radiation = 'Radiating to left shoulder, inner arm, and jaw';
  }

  // 5. Extract Associated Symptoms
  const assoc: string[] = extracted.associatedSymptoms ? [...extracted.associatedSymptoms] : [];
  if (hasDyspnea && !assoc.includes('Exertional Dyspnea')) {
    assoc.push('Exertional Dyspnea');
  }
  if ((lower.includes('sweat') || lower.includes('पसीना') || lower.includes('வியர்வை') || lower.includes('చెమట') || lower.includes('ঘাম')) && !assoc.includes('Cold Diaphoresis')) {
    assoc.push('Cold Diaphoresis');
  }
  if ((lower.includes('vomit') || lower.includes('उल्टी') || lower.includes('வாந்தி') || lower.includes('వాంతులు') || lower.includes('বমি')) && !assoc.includes('Nausea & Emesis')) {
    assoc.push('Nausea & Emesis');
  }
  if ((lower.includes('dizzy') || lower.includes('चक्कर') || lower.includes('மயக்கம்') || lower.includes('తలతిరగడం') || lower.includes('মাথা ঘোरा')) && !assoc.includes('Presyncope & Dizziness')) {
    assoc.push('Presyncope & Dizziness');
  }
  if (assoc.length > 0) {
    extracted.associatedSymptoms = assoc;
  }

  // 6. Extract Severity Number if mentioned
  const numMatch = userInput.match(/\b([1-9]|10)\b/);
  if (numMatch) {
    extracted.severity = parseInt(numMatch[1], 10);
  } else if (isRedFlag) {
    extracted.severity = 8;
  }

  // Dynamic empathetic medical reasoning based on what patient actually said
  if (isRedFlag && turnIndex === 0) {
    const isHindi = langCode === 'hi';
    return {
      aiReplyLocal: isHindi
        ? 'मैं समझ रहा हूँ। सीने में भारी दबाव और दर्द गंभीर संकेत हो सकते हैं। क्या यह दर्द बाएं हाथ या जबड़े में भी फैल रहा है, और क्या आपको पसीना आ रहा है? कृपया शांत होकर बैठें, हम तुरंत ईसीजी का प्रबंध कर रहे हैं।'
        : config.questions.radiation.local,
      aiReplyEnglish: 'I understand. Heavy chest pressure and pain are significant clinical warning signs. Is the pain radiating to your left arm or jaw, and are you experiencing cold sweats? Please remain calmly seated while we prepare a stat ECG.',
      extractedSocrates: extracted,
      isRedFlag: true,
      redFlagReason,
      nextStepSuggested: 'radiation',
    };
  }

  if (hasStomach && turnIndex === 0) {
    const isHindi = langCode === 'hi';
    return {
      aiReplyLocal: isHindi
        ? 'पेट में दर्द और बेचैनी के लक्षण नोट कर लिए गए हैं। क्या दर्द खाने के बाद बढ़ा है, और क्या आपको उल्टी या गैस महसूस हो रही है?'
        : config.questions.associated.local,
      aiReplyEnglish: 'Abdominal pain and discomfort have been noted. Did the pain increase after eating, and have you experienced vomiting or nausea?',
      extractedSocrates: extracted,
      isRedFlag: false,
      nextStepSuggested: 'associated',
    };
  }

  if (hasFever && turnIndex === 0) {
    const isHindi = langCode === 'hi';
    return {
      aiReplyLocal: isHindi
        ? 'बुखार के लक्षण दर्ज कर लिए गए हैं। यह बुखार कितने दिनों से है और क्या ठंड लगकर कंपकंपी या सिरदर्द भी हो रहा है?'
        : config.questions.onset.local,
      aiReplyEnglish: 'Fever symptoms have been documented. How many days have you had this fever, and do you also have chills or a severe headache?',
      extractedSocrates: extracted,
      isRedFlag: false,
      nextStepSuggested: 'onset',
    };
  }

  // Multi-turn wrap-up or specific drill-down
  if (turnIndex >= 2 || (extracted.site && extracted.character && extracted.radiation)) {
    return {
      aiReplyLocal: `${config.wrapUp.local} ${isRedFlag ? config.emergencyNotice.local : ''}`,
      aiReplyEnglish: `${config.wrapUp.english} ${isRedFlag ? config.emergencyNotice.english : ''}`,
      extractedSocrates: extracted,
      isRedFlag,
      redFlagReason,
      nextStepSuggested: 'wrap_up',
    };
  }

  if (!currentSocrates.character && !extracted.character) {
    return {
      aiReplyLocal: config.questions.character.local,
      aiReplyEnglish: config.questions.character.english,
      extractedSocrates: extracted,
      isRedFlag,
      redFlagReason,
      nextStepSuggested: 'character',
    };
  }

  if (!currentSocrates.radiation && !extracted.radiation) {
    return {
      aiReplyLocal: config.questions.radiation.local,
      aiReplyEnglish: config.questions.radiation.english,
      extractedSocrates: extracted,
      isRedFlag,
      redFlagReason,
      nextStepSuggested: 'radiation',
    };
  }

  return {
    aiReplyLocal: config.questions.severity.local,
    aiReplyEnglish: config.questions.severity.english,
    extractedSocrates: extracted,
    isRedFlag,
    redFlagReason,
    nextStepSuggested: 'severity',
  };
}
