import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/Api";
import {
  Chat,
  Channel,
  MessageInput,
  MessageList,
  Thread,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";
import ChatLoader from "../components/ChatLoader";
import ChatHeader from "../components/ChatHeader.jsx";
import useNotificationStore from "../store/useNotificationStore";
import useStreamChatStore from "../store/useStreamChatStore";
const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatPage = () => {
  const { id: target_User_Id } = useParams();
  const navigate = useNavigate();
  const { authUserData } = useAuthUser();
  const { clearUnread } = useNotificationStore();
  const { getClient: getStreamClient, getToken: getStreamToken2 } = useStreamChatStore();
  
  const initializedRef = useRef(false);

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);

  const { data: tokenData } = useQuery({
    queryKey: ["getStreamToken"],
    queryFn: () => getStreamToken(),
    enabled: !!authUserData,
  });

  useEffect(() => {
    if (!authUserData || initializedRef.current || !target_User_Id) return;

    let currentChannel = null;

    const initChat = async () => {
      try {
        initializedRef.current = true;
        
        // Try to get existing client from store first
        let client = getStreamClient();
        let token = getStreamToken2();
        
        // If no client in store, create new one
        if (!client || !token) {
          if (!tokenData?.token) {
            initializedRef.current = false;
            return;
          }
          
          client = StreamChat.getInstance(STREAM_API_KEY);
          token = tokenData.token;
          
          await client.connectUser(
            {
              id: authUserData.user._id,
              name: authUserData.user.Fullname,
              image: authUserData.user.profilePic,
            },
            token
          );
        }

        setChatClient(client);

        const channle_id = [authUserData.user._id, target_User_Id].sort().join("_");
        currentChannel = client.channel("messaging", channle_id, {
          members: [authUserData.user._id, target_User_Id],
        });
        await currentChannel.watch();
        
        clearUnread(currentChannel.id);
        setChannel(currentChannel);
        setLoading(false);
      } catch (error) {
        initializedRef.current = false;
        toast.error("Failed to initialize chat");
      }
    };
    
    initChat();
  }, [tokenData?.token, authUserData?._id, target_User_Id]);

  const handleVideoCall = async () => {
    if (channel) {
      const callLink = `${window.location.origin}/call/${channel.id}`;
      
      try {
        await channel.sendMessage({
          text: `I've started a video call! Join me here: ${callLink}`,
        });
        toast.success("Video call link sent!");
      } catch (error) {
        console.error("Error sending call link:", error);
      }
      
      navigate(`/call/${channel.id}`);
    }
  };

  if (loading || !chatClient || !channel) return <ChatLoader />;

  return (
    <div className="h-full flex flex-col overflow-hidden relative">
      <ChatHeader channel={channel} onVideoCall={handleVideoCall} />
      
      <div className="flex-1 overflow-hidden">
        <Chat client={chatClient}>
          <Channel channel={channel}>
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto">
                <MessageList />
              </div>
              <div className="flex-shrink-0 border-t border-base-300">
                <MessageInput focus />
              </div>
            </div>
            <Thread />
          </Channel>
        </Chat>
      </div>
    </div>
  );
};

export default ChatPage;