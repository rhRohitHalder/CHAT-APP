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

function extractJSONArray(text) {
  const match = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
  return match ? match[0] : null;
}

async function get_Smart_Reply_Suggestions(req, res) {
  const user = req.user;
  const learningLanguage = user.learningLanguage || "Spanish";
  const nativeLanguage = user.nativeLanguage || "English";
  const { messages } = req.body;
  const isDev = process.env.NODE_ENV === "development" || !process.env.NODE_ENV;

  console.log("=== Smart Reply Suggestions Pipeline Started ===");
  console.log(`User: ${user.Fullname} (ID: ${user._id})`);
  console.log(`Languages: Native="${nativeLanguage}", Learning="${learningLanguage}"`);
  console.log(`Total messages in request context: ${messages ? messages.length : 0}`);

  try {
    const hfToken = process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY;
    console.log(`Hugging Face Token configuration status: ${hfToken ? "CONFIGURED (Trimming applied)" : "MISSING"}`);

    if (!hfToken) {
      console.warn("Hugging Face API token is not configured. Falling back to default suggestions.");
      if (isDev) {
        return res.status(500).json({
          message: "Hugging Face token missing in environment variables.",
          fallbackTriggered: "TokenMissing"
        });
      }
      return res.status(200).json({
        suggestions: getFallbackSuggestions(learningLanguage, nativeLanguage),
        fallbackTriggered: "TokenMissing"
      });
    }

    const model = process.env.HF_MODEL || "Qwen/Qwen2.5-7B-Instruct";
    console.log(`Target Hugging Face Model: "${model}"`);

    const systemPrompt = `You are an expert AI language learning assistant and native speaker of "${learningLanguage}". The user's native language is "${nativeLanguage}" and they are learning "${learningLanguage}".
Analyze the provided chat history between the user (role: "assistant") and their conversation partner (role: "user").
Your task is to generate exactly 3 natural, conversational, and context-aware reply suggestions in "${learningLanguage}".

Requirements:
1. The replies must directly respond to the partner's most recent message, maintaining the context and flow of the conversation.
2. The suggestions must be distinct from one another:
   - Suggestion 1: Casual/Friendly (e.g., standard response, enthusiastic agreement).
   - Suggestion 2: Inquisitive (e.g., answering the question and asking a follow-up question to keep the conversation going).
   - Suggestion 3: Expressive/Alternative (e.g., expressing a personal opinion, sharing a feeling, or using a common idiom).
3. Do NOT output generic greetings unless the conversation is just beginning.
4. For each suggestion, provide:
   - "text": The reply in "${learningLanguage}".
   - "translation": The exact translation of the reply in the user's native language ("${nativeLanguage}").
   - "explanation": A brief, helpful grammar tip, usage note, or cultural context (max 8 words) in "${nativeLanguage}" explaining why or when to use this specific reply.

You must return ONLY a raw JSON array of objects. Do not include markdown code fences (like \`\`\`json) or any conversational introduction/conclusion.
Format:
[
  {
    "text": "Reply in ${learningLanguage}",
    "translation": "Translation in ${nativeLanguage}",
    "explanation": "Brief context/tip"
  }
]`;

    const chatContext = (messages || []).slice(-6).map(m => {
      const isCurrentUser = m.user?.id === user._id.toString() || m.userId === user._id.toString();
      return {
        role: isCurrentUser ? "assistant" : "user",
        content: m.text || ""
      };
    });

    console.log("Constructed request context payload:");
    console.log(JSON.stringify(chatContext, null, 2));

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

    console.log(`Hugging Face API response HTTP status: ${response.status}`);

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Hugging Face API error response content: ${errText}`);
      if (isDev) {
        return res.status(500).json({
          message: `Hugging Face API call failed with status ${response.status}`,
          errorResponse: errText,
          fallbackTriggered: "ApiErrorResponse"
        });
      }
      return res.status(200).json({
        suggestions: getFallbackSuggestions(learningLanguage, nativeLanguage),
        fallbackTriggered: "ApiErrorResponse"
      });
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";
    console.log("Raw output content returned by model:");
    console.log(content);
    
    // Extract JSON array robustly
    const jsonString = extractJSONArray(content);
    console.log(`Extracted JSON array string: ${jsonString ? "SUCCESS" : "FAILED (Null)"}`);

    if (!jsonString) {
      console.warn("Could not extract any JSON array structure from model content.");
      if (isDev) {
        return res.status(500).json({
          message: "Failed to extract valid JSON array structure from model response.",
          rawContent: content,
          fallbackTriggered: "JsonExtractionFailure"
        });
      }
      return res.status(200).json({
        suggestions: getFallbackSuggestions(learningLanguage, nativeLanguage),
        fallbackTriggered: "JsonExtractionFailure"
      });
    }

    try {
      const suggestions = JSON.parse(jsonString);
      console.log("Successfully parsed JSON content. Record count:", suggestions.length);
      console.log("Parsed suggestions payload:", JSON.stringify(suggestions, null, 2));

      if (Array.isArray(suggestions) && suggestions.length > 0) {
        return res.status(200).json({ suggestions });
      } else {
        console.warn("Parsed suggestions payload is empty or not an array.");
      }
    } catch (parseError) {
      console.error("JSON parsing error caught:", parseError.message);
      if (isDev) {
        return res.status(500).json({
          message: "JSON parsing error on model output.",
          error: parseError.message,
          rawExtractedString: jsonString,
          fallbackTriggered: "JsonParseFailure"
        });
      }
    }

    // Fallback if parsing fails or returns invalid suggestions
    return res.status(200).json({
      suggestions: getFallbackSuggestions(learningLanguage, nativeLanguage),
      fallbackTriggered: "ParsingValidationFailure"
    });

  } catch (error) {
    console.error("Exception caught in get_Smart_Reply_Suggestions:", error);
    if (isDev) {
      return res.status(500).json({
        message: "Internal exception caught in smart suggestions controller.",
        error: error.message,
        fallbackTriggered: "ControllerException"
      });
    }
    return res.status(200).json({
      suggestions: getFallbackSuggestions(learningLanguage, nativeLanguage),
      fallbackTriggered: "ControllerException"
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
    ],
    bengali: [
      { text: "হ্যালো! কেমন আছেন?", translation: "Hello! How are you?", explanation: "Polite, standard greeting" },
      { text: "হ্যাঁ, আমি আপনার সাথে একমত।", translation: "Yes, I agree with you.", explanation: "Expresses agreement" },
      { text: "দারুণ! এই বিষয়ে আরও বলুন।", translation: "Great! Tell me more about this.", explanation: "Keeps the conversation going" }
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
