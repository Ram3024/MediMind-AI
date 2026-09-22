import { NextRequest, NextResponse } from "next/server";

const LANGUAGE_RULE = `CRITICAL LANGUAGE RULE (follow strictly):
- If the user's message is in ENGLISH → respond ONLY in ENGLISH.
- If the user's message is in HINDI, HINGLISH, ROMANIZED HINDI, or CHAT LANGUAGE (e.g., "mujhe headache hai", "sir dard ho raha hai", "kya karu") → respond ONLY in HINGLISH/CHAT LANGUAGE (Hindi written in Roman/English characters, e.g., "Aapko rest karna chahiye", "Kripya doctor se consult karein", "Pani pijiye").
- NEVER use Devanagari script (like Hindi characters "आपको") under any circumstances. Always use Roman script (English alphabet) for Hinglish/chat language replies.
- Match the user's language exactly in every reply (English for English, Hinglish/Chat language for Hindi/Hinglish).`;

const SYSTEM_PROMPTS: Record<string, string> = {
  doctor: `${LANGUAGE_RULE}

You are Dr. MediMind, an expert AI medical assistant trained in Indian healthcare. You:
- Analyze symptoms clearly and suggest possible conditions
- Recommend OTC medicines available in India with dosage (brand names + generic)
- Include approximate Indian MRP price when suggesting medicines
- Provide diet, hydration, and lifestyle advice relevant to India
- Always add brief medical disclaimers at the end
- Recognize emergencies immediately with urgency
- Format with **bold** for key points and bullet lists`,

  therapist: `${LANGUAGE_RULE}

You are Dr. Serenity, a compassionate AI therapist for Indian mental health. You:
- Provide emotional support and active listening
- Teach stress management and mindfulness techniques
- Are warm, non-judgmental, and supportive`,

  fitnessCoach: `${LANGUAGE_RULE}

You are Coach FitMind, an energetic AI fitness expert. You:
- Create personalized workout plans for home and gym
- Motivate and help track fitness goals
- Are enthusiastic and practical`,

  nutritionExpert: `${LANGUAGE_RULE}

You are NutriMind, an expert AI dietitian. You:
- Create balanced Indian meal plans based on health goals
- Suggest specific Indian foods for health conditions`,

  general: `${LANGUAGE_RULE}

You are MediMind, a comprehensive AI health assistant. You:
- Provide general health information in Indian context
- Are friendly, informative, with appropriate disclaimers`,
};

// Auth methods to try
type AuthMethod = "key_param" | "bearer";

async function callGemini(
  apiKey: string,
  model: string,
  version: string,
  auth: AuthMethod,
  body: object
): Promise<Response> {
  if (auth === "key_param") {
    return fetch(
      `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );
  } else {
    return fetch(
      `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      }
    );
  }
}

async function listAvailableModels(apiKey: string): Promise<string[]> {
  // Try listing models with key param (v1 and v1beta)
  for (const version of ["v1", "v1beta"]) {
    for (const auth of ["key_param", "bearer"] as AuthMethod[]) {
      try {
        let res: Response;
        if (auth === "key_param") {
          res = await fetch(
            `https://generativelanguage.googleapis.com/${version}/models?key=${apiKey}&pageSize=50`
          );
        } else {
          res = await fetch(
            `https://generativelanguage.googleapis.com/${version}/models?pageSize=50`,
            { headers: { Authorization: `Bearer ${apiKey}` } }
          );
        }

        if (res.ok) {
          const data = await res.json();
          const models: string[] = (data.models || [])
            .filter((m: { supportedGenerationMethods?: string[]; name?: string }) =>
              m.supportedGenerationMethods?.includes("generateContent")
            )
            .map((m: { name?: string }) => (m.name || "").replace("models/", ""));
          if (models.length > 0) {
            console.log(`✅ Listed ${models.length} models via ${version}/${auth}:`, models.slice(0, 5));
            return models;
          }
        }
      } catch {
        // continue
      }
    }
  }
  return [];
}

export async function POST(req: NextRequest) {
  try {
    const { message, personality = "doctor", history = [], attachment } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    const systemPrompt = SYSTEM_PROMPTS[personality] || SYSTEM_PROMPTS.general;

    // Build valid history (must start with 'user')
    const validHistory: { role: string; parts: { text: string }[] }[] = [];
    let foundUser = false;
    for (const h of history) {
      if (!foundUser && h.role !== "user") continue;
      foundUser = true;
      validHistory.push({
        role: h.role === "user" ? "user" : "model",
        parts: [{ text: h.content }],
      });
    }

    const userParts: any[] = [{ text: message }];
    if (attachment && attachment.base64 && attachment.mimeType) {
      userParts.push({
        inlineData: {
          data: attachment.base64,
          mimeType: attachment.mimeType
        }
      });
    }

    const contents = [
      ...validHistory,
      { role: "user", parts: userParts },
    ];

    const requestBody = {
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: { temperature: 0.7, maxOutputTokens: 1200 },
    };

    // Step 1: Auto-discover available models
    const availableModels = await listAvailableModels(apiKey);

    // Step 2: Preferred model order (try these first, then discovered ones)
    const preferredModels = [
      "gemini-2.5-flash",
      "gemini-2.5-pro",
      "gemini-2.0-flash",
      "gemini-2.0-flash-exp",
      "gemini-1.5-flash",
      "gemini-1.5-pro",
      "gemini-pro",
    ];

    const modelsToTry = [
      ...preferredModels,
      ...availableModels.filter((m) => !preferredModels.includes(m)),
    ];

    const versions = ["v1", "v1beta"];
    const authMethods: AuthMethod[] = ["key_param", "bearer"];

    for (const model of modelsToTry) {
      for (const version of versions) {
        for (const auth of authMethods) {
          try {
            const res = await callGemini(apiKey, model, version, auth, requestBody);
            if (res.ok) {
              const data = await res.json();
              const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                console.log(`✅ Working: ${version}/${model} [${auth}]`);
                return NextResponse.json({ response: text, model });
              }
            } else {
              const errData = await res.json().catch(() => ({}));
              const errMsg = (errData as { error?: { message?: string } }).error?.message || res.statusText;
              console.warn(`❌ ${version}/${model}[${auth}]: ${res.status} - ${errMsg?.slice(0, 100)}`);
              // Don't try other combos for the same model if it's a 400 auth error
              if (res.status === 400 || res.status === 403) break;
            }
          } catch (e) {
            console.warn(`Error ${version}/${model}[${auth}]:`, e);
          }
        }
      }
    }

    console.warn("⚠️ All Gemini configs failed or API key not configured. Falling back to mock responses.");
    let fallbackText = "";
    if (attachment) {
      if (attachment.type === "pdf") {
        fallbackText = `📄 **[Mock Mode] Medical Report Analysis (${attachment.name})**

I have successfully received and processed your PDF report. Here is a summary of the findings:
- **CBC/Hemogram:** All counts (WBC, RBC, Platelets) are within standard range. Hemoglobin is stable at 13.8 g/dL.
- **Liver/Kidney Function:** Parameters are normal.

*Dosage / Advice:* Keep hydrated. Since this is mock mode, please consult Dr. MediMind with a real Gemini API Key for detailed insights or see a real physician.`;
      } else {
        fallbackText = `📷 **[Mock Mode] Prescription/Image Analysis (${attachment.name})**

I have processed your attached image. It appears to be a medical image/prescription. Here is a mock interpretation:
- **Prescribed items identified:** Paracetamol 650mg, Pantocid 40mg.
- **Instruction:** Take Pantocid on an empty stomach in the morning, and Paracetamol as needed for fever/pain.

*Recommendation:* Please ensure you follow your doctor's official advice. Add a valid Gemini API Key to enable real AI vision analysis.`;
      }
    } else {
      // Basic mock text response
      const lower = message.toLowerCase();
      if (lower.includes("headache") || lower.includes("sir dard")) {
        fallbackText = "Aapko mild headache ke liye rest karna chahiye aur khoob pani peena chahiye. Agar pain badhta hai toh paracetamol (650mg) le sakte hain. Please consult a doctor if it persists.";
      } else if (lower.includes("stomach") || lower.includes("pet dard")) {
        fallbackText = "Pet dard ke liye halka khana khayein aur oil/spicy food se bachein. Aap mint tea ya warm water le sakte hain. Agar jyada dard ho toh doctor se consult karein.";
      } else {
        fallbackText = "Main aapki kaise madad kar sakta hoon? Aap apne symptoms ya kisi medicine ke baare mein pooch sakte hain. (Mock Mode Active)";
      }
    }
    return NextResponse.json({ response: fallbackText, model: "mock-fallback" });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
