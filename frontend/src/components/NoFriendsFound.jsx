import { UsersIcon, UserPlusIcon } from "lucide-react";
import { Link } from "react-router-dom";

const NoFriendsFound = () => {
  return (
    <div className="text-center py-16">
      <div className="inline-flex items-center justify-center size-16 rounded-full bg-primary/10 mb-4">
        <UsersIcon className="size-8 text-primary" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No friends yet</h3>
      <p className="text-base-content opacity-70 max-w-md mx-auto mb-6">
        Connect with language partners below to start practicing together!
      </p>
      <Link to="/" className="btn btn-primary">
        <UserPlusIcon className="size-4 mr-2" />
        Find Language Partners
      </Link>
    </div>
  );
};

export default NoFriendsFound;