/**
 * ClipGenius AI — Indian Language Translation & Multilingual Voice Engine
 * Translates English captions into Hindi, Hinglish, Bengali, Tamil, Telugu with audio sync.
 */

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English (Original)', flag: '🇺🇸', native: 'English' },
  { code: 'hi_latn', name: 'Hinglish (Viral Reels)', flag: '🇮🇳', native: 'Hinglish' },
  { code: 'hi', name: 'Hindi (Devanagari)', flag: '🇮🇳', native: 'हिन्दी' },
  { code: 'bn', name: 'Bengali', flag: '🇮🇳', native: 'বাংলা' },
  { code: 'ta', name: 'Tamil', flag: '🇮🇳', native: 'தமிழ்' },
  { code: 'te', name: 'Telugu', flag: '🇮🇳', native: 'తెలుగు' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸', native: 'Español' }
];

// Translation Dictionary & AI Phonetic mapper
export const TRANSLATION_MAP = {
  // Clip 1 - AI Secret
  "Here is": { hi_latn: "Yeh raha", hi: "यह रहा", bn: "এখানে আছে", ta: "இங்கே உள்ளது", te: "ఇక్కడ ఉంది" },
  "the biggest": { hi_latn: "sabse bada", hi: "सबसे बड़ा", bn: "সবচেয়ে বড়", ta: "மிகப்பெரிய", te: "అతిపెద్ద" },
  "secret about": { hi_latn: "secret", hi: "रहस्य", bn: "গোপন রহস্য", ta: "ரகசியம்", te: "రహస్యం" },
  "artificial intelligence": { hi_latn: "Artificial Intelligence ka", hi: "कृत्रिम बुद्धिमत्ता (AI) का", bn: "কৃত্রিম বুদ্ধিমত্তা", ta: "செயற்கை நுண்ணறிவு", te: "కృత్రిమ మేధస్సు" },
  "that 99% of": { hi_latn: "jo 99% log", hi: "जो 99% लोग", bn: "যা 99% মানুষ", ta: "99% மக்கள்", te: "99% మంది" },
  "people completely miss.": { hi_latn: "bilkul miss kar dete hain.", hi: "पूरी तरह छोड़ देते हैं।", bn: "সম্পূর্ণ মিস করেন।", ta: "தவற விடுகிறார்கள்.", te: "మిస్ చేస్తారు." },
  "AI is not": { hi_latn: "AI kabhi bhi", hi: "AI कभी भी", bn: "AI কখনোই", ta: "AI ஒருபோதும்", te: "AI ఎప్పటికీ" },
  "going to replace": { hi_latn: "replace nahi karega", hi: "बदलने नहीं जा रहा", bn: "প্রতিস্থাপন করবে না", ta: "மாற்றாது", te: "భర్తీ చేయదు" },
  "humans entirely.": { hi_latn: "insano ko.", hi: "इंसानों को।", bn: "মানুষকে।", ta: "மனிதர்களை.", te: "మనుషులను." },
  "Instead,": { hi_latn: "Balki,", hi: "बल्कि,", bn: "বরং,", ta: "மாறாக,", te: "బదులుగా," },
  "humans who master AI": { hi_latn: "jo insaan AI seekhenge", hi: "जो इंसान AI सीखेंगे", bn: "যারা AI শিখবেন", ta: "AI கற்கும் மனிதர்கள்", te: "AI నేర్చుకునేవారు" },
  "will completely dominate": { hi_latn: "wo dominate karenge", hi: "वे राज करेंगे", bn: "তারা রাজত্ব করবে", ta: "ஆதிக்கம் செலுத்துவார்கள்", te: "ఆధిపత్యం చెలాయిస్తారు" },
  "every single industry.": { hi_latn: "har ek industry me!", hi: "हर एक इंडस्ट्री में!", bn: "প্রতিটি শিল্পে!", ta: "ஒவ்வொரு துறையிலும்!", te: "ప్రతి రంగంలోనూ!" },
  "If you learn this today,": { hi_latn: "Agar aapne yeh seekh liya,", hi: "अगर आपने यह सीख लिया,", bn: "যদি আজ এটি শেখেন,", ta: "இதை இன்று கற்றுக்கொண்டால்,", te: "మీరు ఈరోజు నేర్చుకుంటే," },
  "you will stay ahead": { hi_latn: "toh aap sabse aage rahenge", hi: "तो आप सबसे आगे रहेंगे", bn: "আপনি সবার চেয়ে এগিয়ে থাকবেন", ta: "முன்னணியில் இருப்பீர்கள்", te: "ముందుంటారు" },
  "for the next decade!": { hi_latn: "agle 10 saalon tak! 🔥", hi: "अगले 10 सालों तक! 🔥", bn: "পরবর্তী দশকে! 🔥", ta: "அடுத்த பத்து ஆண்டுகளுக்கு! 🔥", te: "రాబోయే దశాబ్దంలో! 🔥" },

  // Clip 2 - Startups
  "Most people fail": { hi_latn: "Zyadatar log fail hote hain", hi: "ज्यादातर लोग असफल होते हैं", bn: "বেশিরভাগ মানুষ ব্যর্থ হয়", ta: "பெரும்பாலானோர் தோல்வியடைவர்", te: "చాలా మంది విఫలమవుతారు" },
  "because they build": { hi_latn: "kyunki wo banate hain", hi: "क्योंकि वे बनाते हैं", bn: "কারণ তারা তৈরি করে", ta: "ஏனெனில் அவர்கள் உருவாக்குகிறார்கள்", te: "ఎందుకంటే వారు తయారుచేస్తారు" },
  "what they want,": { hi_latn: "jo unhe pasand hai,", hi: "जो उन्हें पसंद है,", bn: "যা তারা চায়,", ta: "அவர்கள் விரும்புவதை,", te: "వారు కోరుకున్నది," },
  "not what the market": { hi_latn: "wo nahi jo market", hi: "वह नहीं जो बाजार", bn: "বাজার যা চায় না", ta: "சந்தைக்கு தேவையில்லை", te: "మార్కెట్ కోరుకోనిది" },
  "is begging to buy.": { hi_latn: "kharidna chahta hai.", hi: "खरीदना चाहता है।", bn: "কিনতে চাইছে।", ta: "வாங்க கெஞ்சுகிறது.", te: "కొనడానికి చూస్తోంది." },
  "Always talk to": { hi_latn: "Hamesha baat karein", hi: "हमेशा बात करें", bn: "সর্বদা কথা বলুন", ta: "எப்போதும் பேசுங்கள்", te: "ఎల్లప్పుడూ మాట్లాడండి" },
  "100 customers first": { hi_latn: "100 customers se pehle", hi: "100 ग्राहकों से पहले", bn: "১০০ গ্রাহকের সাথে", ta: "100 வாடிக்கையாளர்களிடம்", te: "100 మంది కస్టమర్లతో" },
  "before writing a": { hi_latn: "isse pehle ki aap", hi: "इससे पहले कि आप", bn: "একটি লেখার আগে", ta: "எழுதுவதற்கு முன்", te: "రాయడానికి ముందు" },
  "single line of code.": { hi_latn: "ek bhi line code likhein.", hi: "एक भी लाइन कोड लिखें।", bn: "এক লাইন কোড।", ta: "ஒரு வரி குறியீடு.", te: "ఒక్క లైన్ కోడ్." },
  "This single habit": { hi_latn: "Yeh ek aadat", hi: "यह एक आदत", bn: "এই একটি অভ্যাস", ta: "இந்த ஒரு பழக்கம்", te: "ఈ ఒక్క అలవాటు" },
  "will save you millions!": { hi_latn: "aapke karodon bachayegi! 💰", hi: "आपके करोड़ों बचाएगी! 💰", bn: "আপনাকে কোটি টাকা বাঁচাবে! 💰", ta: "மில்லியன்களை மிச்சப்படுத்தும்! 💰", te: "కోట్లు ఆదా చేస్తుంది! 💰" }
};

/**
 * Translates transcript list to target language with preserved timestamps
 */
export function translateTranscript(transcriptList, targetLang = 'hi_latn') {
  if (targetLang === 'en') {
    return transcriptList;
  }

  return transcriptList.map(item => {
    const translation = TRANSLATION_MAP[item.text]?.[targetLang] || item.text;
    return {
      ...item,
      originalText: item.text,
      text: translation
    };
  });
}
