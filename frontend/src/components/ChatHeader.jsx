import { VideoIcon } from "lucide-react";
import useAuthUser from "../hooks/useAuthUser";

const ChatHeader = ({ channel, onVideoCall }) => {
  const { authUserData } = useAuthUser();
  const currentUserId = authUserData?.user?._id;
  
  // Get chat partner info from channel members
  const getChatPartnerInfo = () => {
    if (!channel?.state?.members) return { name: "Chat", image: "/default-avatar.png" };
    
    const members = Object.values(channel.state.members);
    const otherMember = members.find(member => member.user.id !== currentUserId);
    
    if (otherMember?.user) {
      return {
        name: otherMember.user.name || otherMember.user.id || "Chat",
        image: otherMember.user.image || "/default-avatar.png"
      };
    }
    
    return { name: "Chat", image: "/default-avatar.png" };
  };

  const { name, image } = getChatPartnerInfo();

  return (
    <div className="h-14 px-4 flex items-center justify-between border-b border-base-300 bg-base-100 flex-shrink-0">
      <div className="flex items-center gap-3">
        <div className="avatar">
          <div className="w-9 rounded-full">
            <img src={image} alt={name} />
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-sm">{name}</h3>
          <p className="text-xs text-base-content/60">Active now</p>
        </div>
      </div>
      
      <button 
        onClick={onVideoCall} 
        className="btn btn-success btn-sm text-white"
        title="Start Video Call"
      >
        <VideoIcon className="size-4" />
      </button>
    </div>
  );
};

export default ChatHeader;