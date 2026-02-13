import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/Api";
import {
  Chat,
  Channel,
  ChannelHeader,
  ChannelList,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";
import ChatLoader from "../components/ChatLoader";
import CallButton from "../components/CallButton";
const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatPage = () => {
  const { id: target_User_Id } = useParams();

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);

  const { authUserData } = useAuthUser();
  const { data: tokenData } = useQuery({
    queryKey: ["getStreamToken"],
    queryFn: () => getStreamToken(),
    enabled: !!authUserData,
    onSuccess: (data) => {
      console.log("Token fetch successful:", data);
    },
    onError: (error) => {
      console.error("Error fetching token:", error);
    },
  });

  // console.log("tokenData", tokenData);
  // console.log("authUserData", authUserData);

  useEffect(() => {
    const initChat = async () => {
      if (!tokenData?.token || !authUserData) return;
      try {
        console.log("initializing chat");

        const client = StreamChat.getInstance(STREAM_API_KEY);
        await client.connectUser(
          {
            id: authUserData.user._id,
            name: authUserData.user.Fullname,
            image: authUserData.user.profilePic,
          },
          tokenData.token
        );

        const channle_id = [authUserData.user._id, target_User_Id].sort().join("_");
        const currChannle = client.channel("messaging", channle_id, {
          members: [authUserData.user._id, target_User_Id],
        });
        await currChannle.watch();
        setChatClient(client);
        setChannel(currChannle);
        setLoading(false);
      } catch (error) {
        console.log("error", error);
        toast.error("Failed to initialize chat");
      }
    };
    initChat();
  }, [tokenData, authUserData, target_User_Id]);

  const handleVideoCall = () => {
    if (channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}`;

      channel.sendMessage({
        text: `I've started a video call. Join me here: ${callUrl}`,
      });

      toast.success("Video call link sent successfully!");
    }
  };
  if (loading || !chatClient || !channel) return <ChatLoader />;
  return (
    <div className="h-[93vh]">
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <div className="w-full relative">
            <CallButton handleVideoCall={handleVideoCall} />
            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageInput focus />
            </Window>
          </div>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
};

export default ChatPage;