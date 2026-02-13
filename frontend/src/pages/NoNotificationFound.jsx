import { BellIcon, UsersIcon } from "lucide-react";
import { Link } from "react-router-dom";

function NoNotificationsFound() {
  return (
    <div className="text-center py-16">
      <div className="inline-flex items-center justify-center size-16 rounded-full bg-primary/10 mb-4">
        <BellIcon className="size-8 text-primary" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No notifications yet</h3>
      <p className="text-base-content opacity-70 max-w-md mx-auto mb-6">
        When you receive friend requests or messages, they'll appear here.
      </p>
      <Link to="/friends" className="btn btn-outline">
        <UsersIcon className="size-4 mr-2" />
        View Friends
      </Link>
    </div>
  );
}

export default NoNotificationsFound;