/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  BhashiniLanguage,
  PatientProfile,
  StructuredClinicalSummary,
  RedFlagAlert,
  PatientQueueItem,
} from '../types';

export type GuidanceContextType =
  | 'landing'
  | 'patient_signin'
  | 'doctor_signin'
  | 'hospital_signin'
  | 'identify'
  | 'voice'
  | 'upload'
  | 'processing'
  | 'summary'
  | 'token'
  | 'doctor_summary'
  | 'his_queue'
  | 'emergency_alert'
  | 'ayush_mode'
  | 'general';

export interface GuidanceContextData {
  patient?: Partial<PatientProfile>;
  summary?: Partial<StructuredClinicalSummary>;
  redFlag?: Partial<RedFlagAlert>;
  tokenNumber?: string;
  department?: string;
  roomNumber?: string;
  doctorName?: string;
  queueCount?: number;
  waitTimeMins?: number;
  customTopic?: string;
}

/**
 * Multilingual Situation-Aware Prompt Dictionary for 22 Scheduled Indian Languages + English
 */
export function getSituationAwareSpeechText(
  contextType: GuidanceContextType,
  data: GuidanceContextData,
  language: BhashiniLanguage
): string {
  const langCode = (language?.code || 'hi').toLowerCase();
  const name = data.patient?.name || (langCode === 'hi' ? 'मरीज' : 'Patient');
  const token = data.tokenNumber || 'OPD-104';
  const dept = data.department || (langCode === 'hi' ? 'हृदय रोग विभाग (कार्डियोलॉजी)' : 'Cardiology OPD');
  const room = data.roomNumber || (langCode === 'hi' ? 'केबिन 104' : 'Cabin 104');
  const complaint = data.summary?.chiefComplaint || (langCode === 'hi' ? 'सीने में भारी दबाव और दर्द' : 'Severe chest pain');
  const doctor = data.doctorName || 'Dr. Ananya Sen';
  const redFlagTitle = data.redFlag?.title || (langCode === 'hi' ? 'आपातकालीन हृदय संबंधी अलर्ट' : 'Emergency Cardiac Alert');

  switch (contextType) {
    case 'token':
    case 'summary': {
      if (langCode === 'hi') {
        return `नमस्कार ${name} जी। आपका ओपीडी टोकन नंबर ${token} है। आपकी प्रारंभिक जांच पूरी हो गई है। कृपया ${dept}, ${room} में जाएं। डॉ ${doctor} आपकी जांच करेंगे।`;
      }
      if (langCode === 'mr') {
        return `नमस्कार ${name} जी. आपला ओपीडी टोकन नंबर ${token} आहे. कृपया ${dept}, ${room} मध्ये जा. डॉक्टर ${doctor} आपली तपासणी करतील.`;
      }
      if (langCode === 'ta') {
        return `வணக்கம் ${name}. உங்கள் ஓபிடி டோக்கன் எண் ${token}. தயவுசெய்து ${dept}, ${room}-க்கு செல்லவும். மருத்துவர் ${doctor} உங்களை பரிசோதிப்பார்.`;
      }
      if (langCode === 'te') {
        return `నమస్కారం ${name} గారు. మీ ఓపీడీ టోకెన్ నంబర్ ${token}. దయచేసి ${dept}, ${room} కి వెళ్ళండి. డాక్టర్ ${doctor} మిమ్మల్ని పరీక్షిస్తారు.`;
      }
      if (langCode === 'bn') {
        return `নমস্কার ${name} বাবু। আপনার ওপিডি টোকেন নম্বর ${token}। অনুগ্রহ করে ${dept}, ${room}-এ যান। ডাক্তার ${doctor} আপনাকে দেখবেন।`;
      }
      if (langCode === 'gu') {
        return `નમસ્તે ${name} ભાઈ/બહેન. તમારો ઓપીડી ટોકન નંબર ${token} છે. કૃપા કરીને ${dept}, ${room} માં જાઓ. ડૉક્ટર ${doctor} તમારી તપાસ કરશે.`;
      }
      if (langCode === 'kn') {
        return `ನಮಸ್ಕಾರ ${name}. ನಿಮ್ಮ ಒಪಿಡಿ ಟೋಕನ್ ಸಂಖ್ಯೆ ${token}. ದಯವಿಟ್ಟು ${dept}, ${room} ಗೆ ತೆರಳಿ. ವೈದ್ಯರು ${doctor} ನಿಮ್ಮನ್ನು ತಪಾಸಣೆ ಮಾಡುತ್ತಾರೆ.`;
      }
      if (langCode === 'ml') {
        return `നമസ്കാരം ${name}. നിങ്ങളുടെ ഒപിഡി ടോക്കൺ നമ്പർ ${token} ആണ്. ദയവായി ${dept}, ${room}-ലേക്ക് പോകുക. ഡോക്ടർ ${doctor} പരിശോധിക്കും.`;
      }
      if (langCode === 'pa') {
        return `ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ${name} ਜੀ। ਤੁਹਾਡਾ ਓਪੀਡੀ ਟੋਕਨ ਨੰਬਰ ${token} ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ${dept}, ${room} ਵਿੱਚ ਜਾਓ। ਡਾਕਟਰ ${doctor} ਤੁਹਾਡੀ ਜਾਂਚ ਕਰਨਗੇ।`;
      }
      if (langCode === 'or') {
        return `ନମସ୍କାର ${name}। ଆପଣଙ୍କ ଓପିଡି ଟୋକନ୍ ନମ୍ବର ${token} ଅଟେ। ଦୟାକରି ${dept}, ${room} କୁ ଯାଆନ୍ତୁ।`;
      }
      if (langCode === 'ur') {
        return `السلام علیکم ${name} صاحب۔ آپ کا او پی ڈی ٹوکن نمبر ${token} ہے۔ براہ کرم ${dept}، ${room} میں تشریف لے جائیں۔`;
      }
      // English / Default
      return `Welcome ${name}. Your OPD token number is ${token}. Your preliminary intake is complete. Please proceed to ${dept}, ${room}. Doctor ${doctor} will consult you shortly.`;
    }

    case 'emergency_alert': {
      if (langCode === 'hi') {
        return `आपातकालीन सूचना: मरीज ${name} में ${redFlagTitle} के लक्षण पाए गए हैं। तुरंत आपातकालीन वार्ड या केबिन 104 में ईसीजी और ट्रोपोनिन जांच हेतु संपर्क करें।`;
      }
      if (langCode === 'mr') {
        return `तात्काळ सूचना: रुग्ण ${name} यांच्यामध्ये गंभीर लक्षणे आढळली आहेत. त्वरित आपत्कालीन कक्षाशी संपर्क साधा.`;
      }
      if (langCode === 'ta') {
        return `அவசர எச்சரிக்கை: நோயாளி ${name}-க்கு தீவிர அறிகுறிகள் கண்டறியப்பட்டுள்ளன. உடனே அவசர சிகிச்சை பிரிவை அணுகவும்.`;
      }
      if (langCode === 'te') {
        return `అత్యవసర హెచ్చరిక: రోగి ${name} లో తీవ్రమైన లక్షణాలు గుర్తించబడ్డాయి. తక్షణమే అత్యవసర విభాగానికి వెళ్ళండి.`;
      }
      if (langCode === 'bn') {
        return `জরুরি সতর্কতা: রোগী ${name}-এর জরুরি লক্ষণ ধরা পড়েছে। অবিলম্বে ইমার্জেন্সি বিভাগে যোগাযোগ করুন।`;
      }
      return `Emergency Priority Alert: Patient ${name} presents with ${redFlagTitle}. Immediate clinical attention, stat 12-lead ECG, and cardiac assessment required at Emergency Triage.`;
    }

    case 'doctor_summary': {
      const socratesSummary = data.summary?.socrates
        ? `Location ${data.summary.socrates.site || 'retrosternal'}, pain severity ${data.summary.socrates.severity || 8} out of 10, radiating to ${data.summary.socrates.radiation || 'left shoulder'}.`
        : '';
      return `Clinical Brief for ${name}, ${data.patient?.age || 52} years ${data.patient?.gender || 'Male'}. Chief complaint: ${complaint}. ${socratesSummary} ABDM Health ID: ${data.patient?.abhaId || 'Verified'}. Triage category: ${data.redFlag?.isTriggered ? 'Urgent STAT' : 'Routine OPD'}.`;
    }

    case 'his_queue': {
      if (langCode === 'hi') {
        return `टोकन नंबर ${token}, मरीज ${name}, कृपया ${dept}, ${room} में तुरंत उपस्थित हों।`;
      }
      if (langCode === 'ta') {
        return `டோக்கன் எண் ${token}, நோயாளி ${name}, தயவுசெய்து ${dept}, ${room}-க்கு வரவும்.`;
      }
      if (langCode === 'te') {
        return `టోకెన్ నంబర్ ${token}, రోగి ${name}, దయచేసి ${dept}, ${room} కి రండి.`;
      }
      if (langCode === 'mr') {
        return `टोकन नंबर ${token}, रुग्ण ${name}, कृपया ${dept}, ${room} मध्ये उपस्थित राहावे.`;
      }
      if (langCode === 'bn') {
        return `টোকেন নম্বর ${token}, রোগী ${name}, অনুগ্রহ করে ${dept}, ${room}-এ আসুন।`;
      }
      return `Hospital announcement: Token number ${token}, patient ${name}, please report to ${dept}, ${room}.`;
    }

    case 'landing': {
      if (langCode === 'hi') {
        return `स्वस्थसेतु डेस्क में आपका स्वागत है। मरीज, डॉक्टर या अस्पताल स्टाफ के रूप में चेक-इन करने के लिए कृपया साइन इन करें।`;
      }
      if (langCode === 'mr') {
        return `आरोग्यसेतू डेस्कवर आपले स्वागत आहे. रुग्ण, डॉक्टर किंवा रुग्णालय कर्मचारी म्हणून चेक-इन करण्यासाठी कृपया साइन इन करा.`;
      }
      if (langCode === 'ta') {
        return `ஆரோக்கியசேது டெஸ்க்கிற்கு நல்வரவு. நோயாளி, மருத்துவர் அல்லது மருத்துவமனை ஊழியராக உள்நுழைய தயவுசெய்து Sign In செய்யவும்.`;
      }
      if (langCode === 'te') {
        return `ఆరోగ్యసేతు డెస్క్‌కు స్వాగతం. రోగి, డాక్టర్ లేదా ఆసుపత్రి సిబ్బందిగా సైన్ ఇన్ చేయండి.`;
      }
      if (langCode === 'bn') {
        return `আরোগ্যসেতু ডেস্কে স্বাগতম। রোগী, ডাক্তার বা হাসপাতাল কর্মী হিসেবে সাইন ইন করুন।`;
      }
      return `Welcome to SwasthyaSetuDesk. Please click Sign In to check in as a patient, doctor, or hospital staff.`;
    }

    case 'patient_signin': {
      if (langCode === 'hi') {
        return `रोगी साइन-इन पृष्ठ। अपने चिकित्सा रिकॉर्ड तक सुरक्षित रूप से पहुंचने के लिए अपना आभा नंबर या पंजीकृत मोबाइल नंबर दर्ज करें।`;
      }
      if (langCode === 'mr') {
        return `रुग्ण साइन-इन पृष्ठ. आपले वैद्यकीय रेकॉर्ड सुरक्षितपणे प्रवेश करण्यासाठी आपला आभा नंबर किंवा नोंदणीकृत मोबाईल नंबर प्रविष्ट करा.`;
      }
      if (langCode === 'ta') {
        return `நோயாளி உள்நுழைவு பக்கம். உங்கள் மருத்துவ பதிவுகளை பாதுகாப்பாக அணுக உங்கள் ஆபா எண் அல்லது பதிவு செய்யப்பட்ட மொபைல் எண்ணை உள்ளிடவும்.`;
      }
      if (langCode === 'te') {
        return `పేషెంట్ సైన్-ఇన్ పేజీ. మీ వైద్య రికార్డులను సురక్షితంగా యాక్సెస్ చేయడానికి మీ ఆభా నంబర్ లేదా మొబైల్ నంబర్ నమోదు చేయండి.`;
      }
      if (langCode === 'bn') {
        return `রোগী সাইন-ইন পাতা। আপনার চিকিৎসা রেকর্ড অ্যাক্সেস করতে আপনার আভা নম্বর বা মোবাইল নম্বর লিখুন।`;
      }
      return `Patient sign in page. Enter your ABHA number or registered mobile number to securely access your medical records.`;
    }

    case 'doctor_signin': {
      if (langCode === 'hi') {
        return `डॉक्टर क्लिनिकल ईएमआर साइन-इन पृष्ठ। अपने ओपीडी वर्कस्टेशन तक पहुंचने के लिए अपने चिकित्सा पंजीकरण प्रमाण-पत्र दर्ज करें।`;
      }
      if (langCode === 'mr') {
        return `डॉक्टर क्लिनिकल ईएमआर साइन-इन पृष्ठ. आपल्या ओपीडी वर्कस्टेशनमध्ये प्रवेश करण्यासाठी आपले वैद्यकीय क्रेडेन्शियल्स प्रविष्ट करा.`;
      }
      if (langCode === 'ta') {
        return `மருத்துவர் மருத்துவ EMR உள்நுழைவு பக்கம். உங்கள் OPD பணிநிலையத்தை அணுக உங்கள் மருத்துவ சான்றுகளை உள்ளிடவும்.`;
      }
      if (langCode === 'te') {
        return `డాక్టర్ క్లినికల్ EMR సైన్-ఇన్ పేజీ. మీ OPD వర్క్‌స్టేషన్‌ను యాక్సెస్ చేయడానికి మీ వైద్య ఆధారాలను నమోదు చేయండి.`;
      }
      if (langCode === 'bn') {
        return `ডাক্তার ক্লিনিক্যাল ইএমআর সাইন-ইন পাতা। আপনার ওপিডি ওয়ার্কস্টেশন অ্যাক্সেস করতে আপনার শংসাপত্র লিখুন।`;
      }
      return `Doctor clinical EMR sign in page. Enter your medical registration credentials to access your OPD workstation.`;
    }

    case 'hospital_signin': {
      if (langCode === 'hi') {
        return `अस्पताल एचआईएस कमांड साइन-इन पृष्ठ। वास्तविक समय ट्राइएज कतार और क्षमता प्रबंधन तक पहुंचने के लिए अपने क्रेडेंशियल दर्ज करें।`;
      }
      if (langCode === 'mr') {
        return `रुग्णालय एचआईएस कमांड साइन-इन पृष्ठ. रिअल-टाइम ट्रायज रांग आणि क्षमता व्यवस्थापनात प्रवेश करण्यासाठी आपले क्रेडेन्शियल्स प्रविष्ट करा.`;
      }
      if (langCode === 'ta') {
        return `மருத்துவமனை HIS கட்டளை உள்நுழைவு பக்கம். நிகழ்நேர வரிசை மற்றும் மேலாண்மை கையேட்டை அணுக உங்கள் சான்றுகளை உள்ளிடவும்.`;
      }
      if (langCode === 'te') {
        return `హాస్పిటల్ HIS కమాండ్ సైన్-ఇన్ పేజీ. రియల్ టైమ్ క్యూ మరియు సామర్థ్య నిర్వహణను యాక్సెస్ చేయడానికి మీ ఆధారాలను నమోదు చేయండి.`;
      }
      if (langCode === 'bn') {
        return `হাসপাতাল এইচআইএস কমান্ড সাইন-ইন পাতা। রিয়েল-টাইম ট্রায়েজ সারি এবং ক্ষমতা পরিচালনা করতে শংসাপত্র লিখুন।`;
      }
      return `Hospital HIS Command sign in page. Enter your facility administrator credentials to access real-time triage queue and capacity management.`;
    }

    case 'identify': {
      if (langCode === 'hi') {
        return `आरोग्यसेतु डेस्क में आपका स्वागत है। कृपया अपना आभा कार्ड क्यूआर कोड स्कैन करें या 14 अंकों का आभा नंबर दर्ज करें।`;
      }
      if (langCode === 'mr') {
        return `आरोग्यसेतू डेस्कवर आपले स्वागत आहे. कृपया आपला आभा कार्ड क्यूआर कोड स्कॅन करा किंवा आभा क्रमांक प्रविष्ट करा.`;
      }
      if (langCode === 'ta') {
        return `ஆரோக்கியசேது டெஸ்க்கிற்கு நல்வரவு. உங்கள் ஆபா கார்டு க்யூஆர் குறியீட்டை ஸ்கேன் செய்யவும் அல்லது ஆபா எண்ணை உள்ளிடவும்.`;
      }
      if (langCode === 'te') {
        return `ఆరోగ్యసేతు డెస్క్‌కు స్వాగతం. దయచేసి మీ ఆభా కార్డు క్యూఆర్ కోడ్‌ను స్కాన్ చేయండి లేదా ఆభా నంబర్‌ను నమోదు చేయండి.`;
      }
      if (langCode === 'bn') {
        return `আরোগ্যসেতু ডেস্কে স্বাগতম। অনুগ্রহ করে আপনার আভা কার্ড কিউআর কোড স্ক্যান করুন বা আভা নম্বর লিখুন।`;
      }
      if (langCode === 'gu') {
        return `આરોગ્યસેતુ ડેસ્ક પર આપનું સ્વાગત છે. કૃપા કરીને તમારું આભા કાર્ડ ક્યૂઆર કોડ સ્કેન કરો અથવા આભા નંબર દાખલ કરો.`;
      }
      if (langCode === 'kn') {
        return `ಆರೋಗ್ಯಸೇತು ಡೆಸ್ಕ್‌ಗೆ ಸ್ವಾಗತ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಆಭಾ ಕಾರ್ಡ್ ಕ್ಯೂಆರ್ ಕೋಡ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ ಅಥವಾ ಆಭಾ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.`;
      }
      if (langCode === 'ml') {
        return `ആരോഗ്യസേതു ഡെസ്കിലേക്ക് സ്വാഗതം. നിങ്ങളുടെ ആഭാ കാർഡ് ക്യുആർ കോഡ് സ്കാൻ ചെയ്യുക അല്ലെങ്കിൽ ആഭാ നമ്പർ നൽകുക.`;
      }
      if (langCode === 'pa') {
        return `ਆਰੋਗਿਆਸੇਤੂ ਡੈਸਕ ਵਿੱਚ ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਆਭਾ ਕਾਰਡ ਕਿਊਆਰ ਕੋਡ ਸਕੈਨ ਕਰੋ ਜਾਂ ਆਭਾ ਨੰਬਰ ਦਰਜ ਕਰੋ।`;
      }
      return `Welcome to SwasthyaSetuDesk. Please scan your ABHA health card QR code or enter your 14-digit ABHA number to begin your OPD check-in.`;
    }

    case 'voice': {
      if (langCode === 'hi') {
        return `कृपया माइक बटन दबाएं और अपनी बीमारी या तकलीफ के बारे में खुलकर बताएं। जैसे दर्द कहां है, कब से है और कैसा महसूस हो रहा है।`;
      }
      if (langCode === 'mr') {
        return `कृपया माइक बटण दाबा आणि आपल्या लक्षणांबद्दल सविस्तर बोला. जसे की दुखणे कुठे आहे आणि कधीपासून आहे.`;
      }
      if (langCode === 'ta') {
        return `தயவுசெய்து மைக்ரோஃபோன் பொத்தானை அழுத்தி, உங்கள் உடல்நலப் பிரச்சனைகளை உங்கள் தாய்மொழியில் பேசவும்.`;
      }
      if (langCode === 'te') {
        return `దయచేసి మైక్రోఫోన్ బటన్ నొక్కి మీ ఆరోగ్య సమస్యల గురించి మాట్లాడండి. నొప్పి ఎక్కడ ఉంది మరియు ఎప్పటి నుండి ఉంది చెప్పండి.`;
      }
      if (langCode === 'bn') {
        return `অনুগ্রহ করে মাইক বোতামটি চাপুন এবং আপনার অসুস্থতার লক্ষণ সম্পর্কে স্পষ্টভাবে কথা বলুন।`;
      }
      return `Please tap the microphone button and speak freely about your symptoms, pain location, and duration in your native language.`;
    }

    case 'upload': {
      if (langCode === 'hi') {
        return `कृपया अपने पुराने डॉक्टर के पर्चे या जांच रिपोर्ट अपलोड करें या कैमरे से उनकी फोटो खींचें।`;
      }
      if (langCode === 'mr') {
        return `कृपया आपल्या मागील वैद्यकीय चिठ्ठ्या किंवा लॅब रिपोर्ट्स अपलोड करा किंवा कॅमेऱ्याने फोटो काढा.`;
      }
      if (langCode === 'ta') {
        return `உங்கள் முந்தைய மருத்துவ சீட்டுகள் அல்லது பரிசோதனை அறிக்கைகளை பதிவேற்றவும் அல்லது கேமரா மூலம் ஸ்கேன் செய்யவும்.`;
      }
      if (langCode === 'te') {
        return `దయచేసి మీ మునుపटी ప్రిస్క్రిప్షన్లు లేదా ల్యాబ్ నివేదికలను అప్‌లోడ్ చేయండి లేదా కెమెరాతో స్కాన్ చేయండి.`;
      }
      return `Please upload your prior medical prescriptions, laboratory reports, or discharge summaries, or use the camera scanner to capture them.`;
    }

    case 'ayush_mode': {
      if (langCode === 'hi') {
        return `आयुष दशविध परीक्षा मोड सक्रिय है। यह आपकी प्रकृति, विकृति, अग्नि और आहार-विहार का विश्लेषण करता है।`;
      }
      return `AYUSH Dashavidha Pariksha mode is active, structuring clinical intake according to Prakriti, Agni, and Ahara-Vihara patterns.`;
    }

    default: {
      return `SwasthyaSetuDesk multilingual voice assistance active for ${language.nativeName}.`;
    }
  }
}
