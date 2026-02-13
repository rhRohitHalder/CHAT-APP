import { useEffect, useRef } from "react";
import { StreamChat } from "stream-chat";
import { getStreamToken } from "../lib/Api";
import useAuthUser from "../hooks/useAuthUser";
import useNotificationStore from "../store/useNotificationStore";
import useStreamChatStore from "../store/useStreamChatStore";
import toast from "react-hot-toast";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

let initializedRef = { current: false };

const GlobalMessageListener = () => {
  const { authUserData } = useAuthUser();
  
  const addMessageNotification = useNotificationStore((state) => state.addMessageNotification);
  const incrementUnread = useNotificationStore((state) => state.incrementUnread);
  const setStreamClient = useStreamChatStore((state) => state.setClient);

  useEffect(() => {
    if (!authUserData || initializedRef.current) return;

    const initListener = async () => {
      try {
        initializedRef.current = true;
        
        const tokenResponse = await getStreamToken();
        if (!tokenResponse?.token) return;

        const client = StreamChat.getInstance(STREAM_API_KEY);
        
        await client.connectUser(
          {
            id: authUserData.user._id,
            name: authUserData.user.Fullname,
            image: authUserData.user.profilePic,
          },
          tokenResponse.token
        );

        // Store client globally for sharing
        setStreamClient(client, tokenResponse.token);

        client.on("message.new", (event) => {
          const message = event.message;
          if (!message) return;
          
          const senderId = message.user?.id;
          const senderName = message.user?.name || message.user?.id || "Unknown";
          
          if (senderId === authUserData.user._id) return;

          toast.success(`New message from ${senderName}`);
          
          addMessageNotification({
            type: "message",
            senderId,
            senderName,
            senderImage: message.user?.image,
            message: message.text?.substring(0, 50) + (message.text?.length > 50 ? "..." : ""),
            channelId: event.channel?.id
          });

          if (event.channel?.id) {
            incrementUnread(event.channel.id);
          }
        });

      } catch (error) {
        initializedRef.current = false;
      }
    };

    initListener();
  }, [authUserData?.user?._id]);

  return null;
};

export default GlobalMessageListener;