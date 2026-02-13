import { Link } from "react-router-dom";
import { LANGUAGE_TO_FLAG } from "../constants";
import { getLanguageFlag } from "../utils/language";
import { MessageSquareIcon, MapPinIcon } from "lucide-react";

const FriendCard = ({ friend }) => {
  return (
    <div className="card bg-base-200 hover:shadow-lg transition-all duration-300">
      <div className="card-body p-5 space-y-4">
        {/* USER INFO */}
        <div className="flex items-center gap-3">
          <div className="avatar size-14 rounded-full">
            <img src={friend.profilePic} alt={friend.Fullname} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg truncate">{friend.Fullname}</h3>
            {friend.location && (
              <div className="flex items-center text-xs opacity-70 mt-1">
                <MapPinIcon className="size-3 mr-1" />
                {friend.location}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <span className="badge badge-secondary badge-sm">
            {getLanguageFlag(friend.nativeLanguage)}
            Native: {friend.nativeLanguage}
          </span>
          <span className="badge badge-outline badge-sm">
            {getLanguageFlag(friend.learningLanguage)}
            Learning: {friend.learningLanguage}
          </span>
        </div>

        <Link to={`/chat/${friend._id}`} className="btn btn-primary btn-sm w-full">
          <MessageSquareIcon className="size-4 mr-2" />
          Message
        </Link>
      </div>
    </div>
  );
};
export default FriendCard;
