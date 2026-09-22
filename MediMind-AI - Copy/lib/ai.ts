/**
 * MediMind AI - AI Integration with Gemini 1.5 Flash
 * Falls back to mock responses when API key not configured
 */

import { aiResponses } from "./mockData";
import { getResponseCategory, detectEmergency } from "./utils";

/**
 * System prompt for MediMind AI Doctor personality
 */
const SYSTEM_PROMPTS: Record<string, string> = {
  doctor: `You are Dr. MediMind, an expert AI medical assistant trained in Indian healthcare. You:
- Analyze symptoms and suggest possible conditions clearly
- Recommend OTC medications available in India with exact dosage information (brand names + generic)
- Mention approximate Indian MRP price for medicines when suggesting them
- Provide diet, hydration, and lifestyle advice in Indian context
- Always add brief medical disclaimers at the end
- Fully support both Hinglish/chat language (Hindi written in Roman/English characters) and English. If the user writes in Hindi, Hinglish, or chat language (e.g. "sir dard ho raha hai"), respond ONLY in Hinglish/chat language (e.g. "Aapko rest karna chahiye"). NEVER use Devanagari characters (like "आपको"). If the user writes in English, respond in English.
- Immediately recognize and respond to medical emergencies with urgency
- Are empathetic, clear, and use simple non-technical language
- Format responses with markdown: use **bold** for key points, bullet points for lists
- When suggesting medicines: always mention dosage, frequency, and any food-related instructions
- For serious conditions, always recommend consulting a doctor`,

  therapist: `You are Dr. Serenity, a compassionate AI therapist specialized in Indian mental health context. You:
- Provide emotional support and active listening
- Teach stress management and relaxation techniques
- Guide through breathing exercises and mindfulness
- Recommend healthy coping strategies suited to Indian lifestyle
- Always encourage professional help for serious conditions
- Are warm, non-judgmental, and supportive
- Match the language of the user (English for English queries; Hinglish/chat language in Roman script with no Devanagari characters for Hindi/Hinglish/chat language queries)`,

  fitnessCoach: `You are Coach FitMind, an energetic AI fitness expert. You:
- Create personalized workout plans suitable for home and gym
- Motivate and help track fitness goals
- Explain proper exercise form and technique
- Suggest recovery tips and injury prevention
- Adapt workouts to Indian lifestyle and equipment availability
- Are enthusiastic, motivating, and practical
- Match the language of the user (English for English queries; Hinglish/chat language in Roman script with no Devanagari characters for Hindi/Hinglish/chat language queries)`,

  nutritionExpert: `You are Nutritionist NutriMind, an expert AI dietitian. You:
- Create balanced meal plans based on health goals using Indian foods
- Suggest specific Indian foods for health conditions (e.g., methi for diabetes, haldi for inflammation)
- Explain nutritional values and benefits
- Provide realistic Indian diet adaptations (roti, dal, sabzi-based plans)
- Consider allergies, dietary restrictions, and regional preferences
- Are knowledgeable, practical, and culturally sensitive
- Match the language of the user (English for English queries; Hinglish/chat language in Roman script with no Devanagari characters for Hindi/Hinglish/chat language queries)`,

  general: `You are MediMind, a comprehensive AI health assistant. You:
- Provide general health information and wellness tips
- Answer questions about medicines, conditions, and procedures in Indian context
- Connect users to appropriate specialists when needed
- Support both Hinglish/chat language (Hindi in Roman script, no Devanagari) and English. Match the language exactly.
- Are friendly, informative, and always add appropriate disclaimers`,
};

/**
 * System prompt specifically for medicine information queries
 */
const MEDICINE_INFO_PROMPT = `You are a clinical pharmacist AI assistant specialized in Indian medicines. 
When asked about a medicine, provide a well-structured response with these sections:

**💊 [Medicine Name]**

**📋 Uses (Kisliye hai):**
- List main uses/indications

**⚖️ Dosage (Khurak):**
- Adult dose with timing
- Child dose if applicable
- How to take (with/without food, water)

**⚠️ Side Effects (Dushprabhav):**
- Common side effects
- Serious side effects to watch for

**🚫 Warnings (Savdhaniyan):**
- Who should NOT take this medicine
- Drug interactions if any
- Pregnancy/breastfeeding safety

**💰 Price in India (Keemat):**
- Approximate MRP range
- Common brand names in India

**🔄 Alternatives (Vikalp):**
- Generic alternatives
- Similar medicines

**⚕️ Doctor Consultation:** When to see a doctor

If the user's language is English, add: "⚠️ This information is for educational purposes only. Consult a doctor or pharmacist before taking any medicine."
If the user's language is Hindi/Hinglish, add: "⚠️ Yeh jankari sirf educational purpose ke liye hai. Dawai lene se pehle doctor ya pharmacist se salah lein."
Match the response language to what the user asked in (English for English, Romanized Hinglish/chat language for Hindi/Hinglish).`;

/**
 * Get the API key from localStorage (client) or env (server)
 */
function getApiKey(): string {
  if (typeof window !== "undefined") {
    return localStorage.getItem("medimind-gemini-key") || process.env.GEMINI_API_KEY || "";
  }
  return process.env.GEMINI_API_KEY || "";
}

/**
 * Get AI response - uses Gemini 1.5 Flash if key available, otherwise mock responses
 */
export async function getAIResponse(
  message: string,
  personality: string = "doctor",
  conversationHistory: { role: string; content: string }[] = []
): Promise<string> {
  // Check for emergency first
  if (detectEmergency(message)) {
    return aiResponses.emergency[0];
  }

  const apiKey = getApiKey();

  // Try Gemini API if key is configured
  if (apiKey) {
    try {
      return await callGeminiAPI(message, personality, conversationHistory, apiKey);
    } catch (error) {
      console.error("Gemini API error, falling back to mock:", error);
    }
  }

  // Fallback to mock responses
  return getMockResponse(message, personality);
}

/**
 * Get structured medicine information - uses Gemini 1.5 Flash
 */
export async function getMedicineInfo(medicineName: string): Promise<string> {
  const apiKey = getApiKey();

  if (apiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: MEDICINE_INFO_PROMPT }],
            },
            contents: [
              {
                role: "user",
                parts: [{ text: `Tell me about the medicine: ${medicineName}` }],
              },
            ],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 1500,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      }
    } catch (error) {
      console.error("Medicine info fetch error:", error);
    }
  }

  return getMockMedicineInfo(medicineName);
}

/**
 * Call Google Gemini 1.5 Flash API
 */
async function callGeminiAPI(
  message: string,
  personality: string,
  history: { role: string; content: string }[],
  apiKey: string
): Promise<string> {
  const systemPrompt = SYSTEM_PROMPTS[personality] || SYSTEM_PROMPTS.general;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: [
          ...history.map((h) => ({
            role: h.role === "user" ? "user" : "model",
            parts: [{ text: h.content }],
          })),
          {
            role: "user",
            parts: [{ text: message }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1200,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_ONLY_HIGH",
          },
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_ONLY_HIGH",
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error: ${response.status} — ${errText}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || getMockResponse(message, personality);
}

/**
 * Detect if message is asking about a specific medicine
 */
export function detectMedicineQuery(message: string): string | null {
  const lower = message.toLowerCase();
  const medicineKeywords = [
    "medicine", "tablet", "capsule", "syrup", "injection", "dawa", "dawai",
    "दवा", "दवाई", "tablet", "गोली", "खुराक", "dose", "dosage",
    "paracetamol", "ibuprofen", "cetirizine", "omeprazole", "metformin",
    "azithromycin", "amoxicillin", "crocin", "dolo", "combiflam",
    "pantoprazole", "atorvastatin", "aspirin", "vitamin", "calcium",
  ];

  const infoKeywords = ["what is", "tell me about", "information about", "बताओ", "के बारे में", "kya hai", "क्या है", "use", "uses", "side effect", "dose"];

  const hasInfoIntent = infoKeywords.some((kw) => lower.includes(kw));
  const hasMedicineWord = medicineKeywords.some((kw) => lower.includes(kw));

  if (hasInfoIntent && hasMedicineWord) {
    // Extract medicine name — take the longest matching word from common medicines list
    const commonMeds = [
      "paracetamol", "ibuprofen", "cetirizine", "omeprazole", "metformin",
      "azithromycin", "amoxicillin", "crocin", "dolo", "combiflam",
      "pantoprazole", "atorvastatin", "aspirin", "vitamin d", "vitamin c",
      "calcium", "doxycycline", "ciprofloxacin", "ranitidine", "losartan",
    ];
    for (const med of commonMeds) {
      if (lower.includes(med)) return med;
    }
    // Return the whole message for AI to parse
    return message;
  }

  return null;
}

/**
 * Get mock response based on keyword matching (fallback)
 */
function getMockResponse(message: string, personality: string): string {
  const category = getResponseCategory(message);

  if (personality === "therapist") return getTherapistResponse(message);
  if (personality === "fitnessCoach") return getFitnessResponse(message);
  if (personality === "nutritionExpert") return getNutritionResponse(message);

  const responses = aiResponses[category] || aiResponses.default;
  return responses[Math.floor(Math.random() * responses.length)];
}

function getMockMedicineInfo(name: string): string {
  return `**💊 ${name}**

**📋 Uses:**
- General pain relief and fever management
- Anti-inflammatory properties

**⚖️ Dosage:**
- Adults: As directed by physician
- Take with food if stomach upset occurs

**⚠️ Side Effects:**
- Nausea, stomach upset (common)
- Allergic reactions (rare)

**🚫 Warnings:**
- Consult your doctor before use
- Not recommended during pregnancy without medical advice

**💰 Price in India:**
- Varies by brand — generally ₹20–₹200 per strip

**⚕️ Doctor Consultation:**
- If symptoms persist beyond 3 days, please see a doctor

⚠️ *API key required for complete, real-time medicine info. Add your Gemini key in chat settings.*`;
}

function getTherapistResponse(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("anxious") || lower.includes("anxiety") || lower.includes("stress") || lower.includes("tension") || lower.includes("घबराहट")) {
    return `I hear you, and I want you to know that feeling anxious is completely valid 💙\n\n**Let's try a quick calming exercise:**\n\n🌬️ **4-7-8 Breathing Technique:**\n1. Breathe IN for 4 counts\n2. HOLD for 7 counts\n3. Breathe OUT for 8 counts\n4. Repeat 3-4 times\n\n**Grounding Exercise (5-4-3-2-1):**\n- Name 5 things you can SEE\n- 4 things you can TOUCH\n- 3 things you can HEAR\n- 2 things you can SMELL\n- 1 thing you can TASTE\n\n**Remember:** This feeling will pass. You are safe. 🌟\n\nWould you like to talk more about what's causing your anxiety? I'm here to listen without judgment.`;
  }
  if (lower.includes("sleep") || lower.includes("insomnia") || lower.includes("neend")) {
    return `Sleep struggles are really exhausting 😴 Let me help you.\n\n**Sleep Hygiene Tips:**\n- 📵 No screens 1 hour before bed\n- 🌡️ Keep room cool (18-20°C)\n- ⏰ Same sleep/wake time daily\n- 🫖 Chamomile tea or warm milk before bed\n- 📖 Light reading or meditation\n\n**Progressive Muscle Relaxation:**\nStarting from your toes, tense each muscle group for 5 seconds, then release.\n\n**If you can't sleep:**\n- Get up and do something calm\n- Don't lie in bed awake >20 min\n- Write down worrying thoughts\n\nHow long have you been having trouble sleeping? 🌙`;
  }
  return `Thank you for sharing that with me 💙 I'm here to listen and support you.\n\nRemember, seeking help is a sign of strength, not weakness. Together, we can work through whatever you're experiencing.\n\nWould you like to:\n- 🧘 Try a relaxation exercise\n- 💬 Talk through what's on your mind\n- 📋 Explore coping strategies\n- 🎯 Set some wellness goals\n\nWhat feels right for you right now?`;
}

function getFitnessResponse(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("weight loss") || lower.includes("lose weight") || lower.includes("vajan")) {
    return `Let's crush those weight loss goals! 💪🔥\n\n**Your 7-Day Starter Plan:**\n\n🏃 **Cardio (4x/week):**\n- Morning: 30 min brisk walk/jog\n- Target: 150-200 min cardio/week\n\n💪 **Strength (3x/week):**\n- Squats: 3×15\n- Push-ups: 3×10\n- Plank: 3×30 sec\n- Lunges: 3×12 each leg\n\n🔥 **HIIT (2x/week):**\n- 20 min high-intensity intervals\n- 40 sec on / 20 sec rest\n\n**Diet Tips for Fat Loss:**\n- Caloric deficit: -300 to -500 kcal\n- High protein: 1.6g/kg body weight\n- Cut sugary drinks completely\n- Eat at regular times\n\n**Remember:** Progress > Perfection! 🌟`;
  }
  return `Let's get you moving! 🏃‍♂️💪\n\n**Today's Quick Workout (30 min):**\n\n🔥 **Warm Up (5 min):**\n- Jumping jacks: 2 min\n- Arm circles & leg swings: 3 min\n\n💪 **Main Workout:**\n- Squats: 3×15\n- Push-ups: 3×10\n- Mountain climbers: 3×20\n- Burpees: 3×8\n- Plank: 3×30 sec\n\n🧘 **Cool Down (5 min):**\n- Full body stretches\n\n**Daily Goals:**\n- 🚶 10,000 steps\n- 💧 2.5L water\n- 😴 7-8 hours sleep\n\nYou've got this! What's your fitness goal? 🎯`;
}

function getNutritionResponse(message: string): string {
  return `Let me create a personalized nutrition plan for you! 🥗\n\n**Balanced Indian Daily Meal Plan:**\n\n🌅 **Breakfast (7-8 AM):**\n- Oatmeal with fruits + nuts OR\n- 2 boiled eggs + 2 roti + sabzi\n- Green tea or black coffee\n\n☀️ **Mid-Morning (10-11 AM):**\n- Seasonal fruits (apple, banana)\n- Handful of almonds (6-8)\n\n🌞 **Lunch (1-2 PM):**\n- 2 rotis + sabzi\n- Dal (protein source)\n- Curd/Raita\n- Salad (cucumber, tomato, onion)\n\n🌆 **Evening Snack (4-5 PM):**\n- Roasted chana or murmura\n- Coconut water or buttermilk\n\n🌙 **Dinner (7-8 PM):**\n- Light khichdi or vegetable soup\n- Grilled paneer or chicken\n- Warm haldi milk at bedtime\n\n**Key Nutrients:**\n- 🫀 Heart: Omega-3 (fish, flax seeds, walnuts)\n- 🦴 Bones: Calcium (dairy, ragi, til)\n- 🧠 Brain: B12, zinc (eggs, legumes)\n- 💪 Muscles: Protein (legumes, eggs, paneer)\n\n**Hydration:** 2.5-3L water daily 💧`;
}
