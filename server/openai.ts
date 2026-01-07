import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://openrouter.ai/api/v1"
}) : null;

interface MoodAnalysisResult {
  sentiment: string;
  insights: string;
  alertType: "urgent" | "concerning" | "informational" | null;
  alertReason: string | null;
}

export async function analyzeMoodEntry(
  moodLevel: number,
  stressLevel: number,
  journalEntry?: string
): Promise<MoodAnalysisResult> {
  if (!openai) {
    // Return default analysis if OpenAI is not configured
    return {
      sentiment: "neutral",
      insights: "AI analysis not available - please configure OpenAI API key",
      alertType: null,
      alertReason: null,
    };
  }
  try {
    const prompt = `You are a mental health wellness AI assistant for a student support system called WellTrack. 
Analyze the following mood check-in data and provide insights.

Mood Level: ${moodLevel}/5 (1=Very Low, 5=Great)
Stress Level: ${stressLevel}/5 (1=Relaxed, 5=Severe)
${journalEntry ? `Journal Entry: "${journalEntry}"` : "No journal entry provided."}

Provide your analysis in JSON format with the following structure:
{
  "sentiment": "A brief 1-2 word sentiment label (e.g., 'Positive', 'Neutral', 'Anxious', 'Struggling', 'Content')",
  "insights": "A supportive, empathetic message (2-3 sentences) that acknowledges how the student is feeling and offers gentle encouragement or a helpful tip. Be warm and understanding, not clinical.",
  "alertType": null or "urgent" or "concerning" or "informational",
  "alertReason": null or "A brief explanation of why this entry triggered an alert"
}

Alert type guidelines:
- "urgent": If mood is 1 AND stress is 5, OR if journal entry contains concerning language about self-harm, hopelessness, or crisis
- "concerning": If mood is 1-2 AND stress is 4-5, OR if there's a pattern of declining mood/high stress
- "informational": If mood or stress patterns might benefit from check-in but aren't immediately concerning
- null: Normal entries that don't require special attention

Be supportive and focus on the student's wellbeing. Never be judgmental.`;

    const response = await openai.chat.completions.create({
      model: "openai/gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_completion_tokens: 500,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    const result = JSON.parse(content);
    return {
      sentiment: result.sentiment || "Unknown",
      insights: result.insights || "Thank you for checking in today. Taking time to reflect on your feelings is an important step in maintaining your wellbeing.",
      alertType: result.alertType || null,
      alertReason: result.alertReason || null,
    };
  } catch (error) {
    console.error("OpenAI analysis error:", error);
    // Return a default response if AI fails
    return {
      sentiment: moodLevel >= 3 ? "Stable" : "Low",
      insights: "Thank you for checking in today. Remember that taking time to reflect on your feelings is valuable for your mental health.",
      alertType: moodLevel <= 2 && stressLevel >= 4 ? "concerning" : null,
      alertReason: moodLevel <= 2 && stressLevel >= 4 
        ? "Low mood combined with high stress detected" 
        : null,
    };
  }
}
