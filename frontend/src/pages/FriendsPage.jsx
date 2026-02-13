import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { UsersIcon, UserPlusIcon } from "lucide-react";
import { getUserFriends } from "../lib/Api";
import FriendCard from "../components/FriendCard.jsx";
import NoFriendsFound from "../components/NoFriendsFound.jsx";

const FriendsPage = () => {
  const { data: friendsRaw = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  // check if the data is an array or an object with a 'friends' property
  const friends = Array.isArray(friendsRaw)
    ? friendsRaw
    : friendsRaw.friends || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto space-y-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Your Friends
          </h2>
          <Link to="/notification" className="btn btn-outline btn-sm">
            <UsersIcon className="mr-2 size-4" />
            Friend Requests
          </Link>
        </div>
        
        {loadingFriends ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : friends.length === 0 ? (
          <NoFriendsFound />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {friends.map((friend) => (
              <FriendCard key={friend._id} friend={friend} />
            ))}
          </div>
        )}

        {/* Find New Friends Section */}
        <section className="mt-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center size-16 rounded-full bg-primary/10 mb-4">
              <UserPlusIcon className="size-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Looking for more friends?</h3>
            <p className="text-base-content opacity-70 mb-6 max-w-md mx-auto">
              Discover language learners who match your interests and goals
            </p>
            <Link to="/" className="btn btn-primary">
              Find Language Partners
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default FriendsPage;