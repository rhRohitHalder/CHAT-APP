import React, { useEffect, useState } from "react";
import { useChannelStateContext, useChatContext, useMessageInputContext } from "stream-chat-react";
import { SparklesIcon, Loader2Icon } from "lucide-react";
import { axios_instance } from "../lib/axios";
import useAuthUser from "../hooks/useAuthUser";

const SmartReplySuggestions = () => {
  const { messages, channel } = useChannelStateContext();
  const { client } = useChatContext();
  const { authUserData } = useAuthUser();
  
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const currentUserId = client.userID;
  const learningLanguage = authUserData?.user?.learningLanguage || "Spanish";

  useEffect(() => {
    if (!messages || messages.length === 0) {
      setSuggestions([]);
      return;
    }

    const lastMessage = messages[messages.length - 1];
    
    // Only generate suggestions if the last message in the channel was sent by the chat partner
    if (lastMessage.user?.id && lastMessage.user.id !== currentUserId) {
      fetchSmartSuggestions();
    } else {
      setSuggestions([]); // Clear suggestions if user themselves sent the last message
    }
  }, [messages, currentUserId]);

  const fetchSmartSuggestions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get last 6 messages context
      const lastMessagesContext = messages.slice(-6).map(m => ({
        id: m.id,
        text: m.text,
        user: {
          id: m.user?.id,
          name: m.user?.name
        }
      }));

      const response = await axios_instance.post("/chat/suggestions", {
        messages: lastMessagesContext
      });

      setSuggestions(response.data.suggestions || []);
    } catch (err) {
      console.error("Error fetching smart replies suggestions:", err);
      setError("Failed to fetch suggestions");
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = async (suggestionText) => {
    try {
      if (channel) {
        await channel.sendMessage({
          text: suggestionText,
        });
      }
    } catch (err) {
      console.error("Error sending smart reply:", err);
    }
  };

  if (!messages || messages.length === 0) return null;
  const lastMessage = messages[messages.length - 1];
  
  // Hide suggestions bar completely if the last message is from the current user
  if (lastMessage.user?.id === currentUserId) return null;

  return (
    <div className="px-4 py-2 border-t border-base-300 bg-base-100/60 backdrop-blur-md flex flex-col gap-2">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-primary/80">
        <SparklesIcon className="size-3.5 animate-pulse text-accent" />
        <span>Contextual Suggestions ({learningLanguage.charAt(0).toUpperCase() + learningLanguage.slice(1)})</span>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-2.5 text-sm text-base-content/60">
          <Loader2Icon className="size-4 animate-spin text-primary" />
          <span>Generating context-aware replies...</span>
        </div>
      ) : error ? (
        <div className="text-xs text-error/80 py-1.5">
          {error}. <button onClick={fetchSmartSuggestions} className="underline font-medium hover:text-error">Retry</button>
        </div>
      ) : suggestions.length === 0 ? (
        <div className="text-xs text-base-content/50 py-1.5">
          No suggestions available for this message.
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 py-1">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion.text)}
              className="group relative flex flex-col items-start px-3 py-2 rounded-xl bg-base-200 hover:bg-primary hover:text-primary-content border border-base-300 hover:border-primary transition-all duration-200 text-left max-w-full sm:max-w-xs shadow-sm hover:shadow-md cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
            >
              <span className="font-medium text-sm line-clamp-1">
                {suggestion.text}
              </span>
              
              {/* Tooltip / Details */}
              <span className="text-[10px] opacity-75 group-hover:text-primary-content/90 line-clamp-1 mt-0.5">
                {suggestion.translation}
              </span>

              {/* Badges for explanations on hover/focus */}
              {suggestion.explanation && (
                <span className="absolute -top-2 right-2 scale-0 group-hover:scale-100 transition-all duration-200 bg-accent text-accent-content font-mono text-[9px] px-1.5 py-0.5 rounded-md shadow">
                  {suggestion.explanation}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SmartReplySuggestions;
