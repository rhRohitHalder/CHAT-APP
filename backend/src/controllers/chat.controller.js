import { generateStreamToken } from "../lib/stream.js";

async function get_Stream_Token(req, res) {
  try {
    // console.log("Generating token for user:", req.user.id);
    const token = await generateStreamToken(req.user.id);
    // console.log("Generated token:", token);
    res.status(200).json({ token }); // Make sure to return an object with a token property
  } catch (error) {
    console.error("Error in get_Stream_Token:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}

async function get_Smart_Reply_Suggestions(req, res) {
  const user = req.user;
  const learningLanguage = user.learningLanguage || "Spanish";
  const nativeLanguage = user.nativeLanguage || "English";
  const { messages } = req.body;

  try {
    const hfToken = process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY;
    if (!hfToken) {
      console.warn("Hugging Face API token is not configured. Falling back to default suggestions.");
      return res.status(200).json({
        suggestions: getFallbackSuggestions(learningLanguage, nativeLanguage)
      });
    }

    const model = process.env.HF_MODEL || "Qwen/Qwen2.5-7B-Instruct";
    const systemPrompt = `You are a helpful language learning assistant. The user is a native speaker of "${nativeLanguage}" and is learning "${learningLanguage}".
Based on the chat history between the user and their partner, generate exactly 3 context-aware, natural, and friendly reply suggestions in "${learningLanguage}" that help the user respond to the last message and practice conversational skills.
For each suggestion, provide its translation in "${nativeLanguage}" and a very brief explanation/tip (max 5 words) in "${nativeLanguage}" about when to use it or its grammatical context.

Format your entire response as a valid JSON array of objects. Do not include markdown code block syntax (like \`\`\`json) or any other text before/after the JSON.
Each object in the array must have exactly these keys:
- "text": The suggested reply in "${learningLanguage}".
- "translation": The translation of the reply in "${nativeLanguage}".
- "explanation": A brief tip (max 5 words) in "${nativeLanguage}" about the context or usage.`;

    const chatContext = (messages || []).slice(-6).map(m => {
      const isCurrentUser = m.user?.id === user._id.toString() || m.userId === user._id.toString();
      return {
        role: isCurrentUser ? "assistant" : "user",
        content: m.text || ""
      };
    });

    const response = await fetch(`https://router.huggingface.co/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${hfToken.trim()}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          ...chatContext
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Hugging Face API error (status ${response.status}): ${errText}`);
      return res.status(200).json({
        suggestions: getFallbackSuggestions(learningLanguage, nativeLanguage)
      });
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";
    
    // Clean and parse JSON
    let cleanText = content.trim();
    if (cleanText.startsWith("```json")) {
      cleanText = cleanText.substring(7);
    } else if (cleanText.startsWith("```")) {
      cleanText = cleanText.substring(3);
    }
    if (cleanText.endsWith("```")) {
      cleanText = cleanText.substring(0, cleanText.length - 3);
    }
    cleanText = cleanText.trim();

    try {
      const suggestions = JSON.parse(cleanText);
      if (Array.isArray(suggestions) && suggestions.length > 0) {
        return res.status(200).json({ suggestions });
      }
    } catch (parseError) {
      console.error("Error parsing Hugging Face JSON response:", parseError, "Raw content:", content);
    }

    // Fallback if parsing fails or returns invalid suggestions
    return res.status(200).json({
      suggestions: getFallbackSuggestions(learningLanguage, nativeLanguage)
    });

  } catch (error) {
    console.error("Error in get_Smart_Reply_Suggestions:", error);
    return res.status(200).json({
      suggestions: getFallbackSuggestions(learningLanguage, nativeLanguage)
    });
  }
}

function getFallbackSuggestions(learningLanguage, nativeLanguage) {
  const lang = (learningLanguage || "").toLowerCase();

  const suggestionsMap = {
    spanish: [
      { text: "¡Hola! ¿Qué tal estás?", translation: "Hi! How are you doing?", explanation: "Friendly, casual greeting" },
      { text: "Sí, estoy totalmente de acuerdo contigo.", translation: "Yes, I completely agree with you.", explanation: "Expresses strong agreement" },
      { text: "Qué bien. Cuéntame un poco más sobre eso.", translation: "Great. Tell me a bit more about that.", explanation: "Keeps the conversation going" }
    ],
    french: [
      { text: "Salut! Comment ça va?", translation: "Hi! How's it going?", explanation: "Friendly, casual greeting" },
      { text: "Oui, je suis tout à fait d'accord avec toi.", translation: "Yes, I completely agree with you.", explanation: "Expresses strong agreement" },
      { text: "C'est super. Raconte-m'en plus à ce sujet.", translation: "That's great. Tell me more about it.", explanation: "Keeps the conversation going" }
    ],
    german: [
      { text: "Hallo! Wie geht es dir?", translation: "Hello! How are you?", explanation: "Friendly, standard greeting" },
      { text: "Ja, ich stimme dir voll und ganz zu.", translation: "Yes, I agree with you completely.", explanation: "Expresses strong agreement" },
      { text: "Das ist toll. Erzähl mir mehr darüber.", translation: "That's great. Tell me more about it.", explanation: "Keeps the conversation going" }
    ],
    japanese: [
      { text: "こんにちは！お元気ですか？", translation: "Hello! How are you?", explanation: "Polite greeting" },
      { text: "はい、私もそう思います。", translation: "Yes, I think so too.", explanation: "Polite agreement" },
      { text: "いいですね。もっと詳しく教えてください。", translation: "Sounds good. Please tell me more.", explanation: "Keeps the conversation going" }
    ]
  };

  const defaultSuggestions = [
    { text: `Hello! Nice to meet you.`, translation: "Greeting", explanation: "Standard polite greeting" },
    { text: `Yes, that sounds very interesting!`, translation: "Expressing interest", explanation: "Shows enthusiasm" },
    { text: `Can you tell me more about it?`, translation: "Asking for details", explanation: "Encourages partner to talk" }
  ];

  for (const [key, value] of Object.entries(suggestionsMap)) {
    if (lang.includes(key)) {
      return value;
    }
  }

  return defaultSuggestions;
}

export { get_Stream_Token, get_Smart_Reply_Suggestions };
