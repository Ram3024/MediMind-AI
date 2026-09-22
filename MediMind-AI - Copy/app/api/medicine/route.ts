import { NextRequest, NextResponse } from "next/server";

const MEDICINE_SYSTEM_PROMPT = `You are a clinical pharmacist AI assistant specialized in Indian medicines and healthcare.
When asked about a medicine, provide a detailed, structured response. 
Be accurate, practical, and use information relevant to the Indian pharmaceutical market.
Always include Indian brand names, MRP prices in INR, and availability in India.
Add a clear disclaimer at the end.
Format your response in clean markdown with emojis for readability.`;

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured", fallback: true },
        { status: 503 }
      );
    }

    const prompt = `Provide comprehensive medicine information for: "${query}"

Structure your response exactly like this:

**💊 [Medicine Generic Name] ([Strength if applicable])**
*Brand Names in India: [list 3-5 common Indian brands]*

---

**📋 Uses (क्या काम आती है)**
- [Primary use]
- [Secondary uses]

**⚖️ Dosage & How to Take (खुराक)**
- **Adults:** [dose, frequency, duration]
- **Children:** [pediatric dose or "Consult doctor"]
- **Special Instructions:** [with food/empty stomach, water intake, etc.]

**⏱️ How Long to Take**
- [Duration of treatment]

**⚠️ Common Side Effects (आम दुष्प्रभाव)**
- [List 3-5 common side effects]

**🚨 Serious Side Effects (गंभीर दुष्प्रभाव — Doctor से तुरंत मिलें)**
- [List serious side effects that need immediate attention]

**🚫 Who Should NOT Take This (किसे नहीं लेनी चाहिए)**
- [Contraindications]
- [Drug interactions]
- [Pregnancy/breastfeeding status]

**💰 Price in India (भारत में कीमत)**
- Generic: ₹[range] per strip/bottle
- Branded: ₹[range] per strip/bottle
- Available OTC: [Yes/No — Prescription needed: Yes/No]

**🔄 Common Alternatives (विकल्प)**
- [2-3 alternative medicines in same class]

**🏥 When to See a Doctor (डॉक्टर के पास कब जाएं)**
- [Specific situations]

---
⚠️ *यह जानकारी केवल शैक्षिक उद्देश्य के लिए है। कोई भी दवाई शुरू करने, बदलने या बंद करने से पहले अपने डॉक्टर या फार्मासिस्ट से सलाह ज़रूर लें।*
*This information is for educational purposes only. Always consult your doctor or pharmacist before starting, changing, or stopping any medication.*`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: MEDICINE_SYSTEM_PROMPT }],
          },
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            topP: 0.9,
            maxOutputTokens: 2000,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_ONLY_HIGH",
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", errorText);
      return NextResponse.json(
        { error: `AI service error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 500 }
      );
    }

    return NextResponse.json({ result: text });
  } catch (error) {
    console.error("Medicine API route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
