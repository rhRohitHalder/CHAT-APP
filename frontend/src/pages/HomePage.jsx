import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { useThemeStore } from "../store/useTheme";
import { useEffect, useState } from "react";
import {
  getOutGoingFriendReqs,
  getRecommendedUsers,
  getUserFriends,
  sendFriendRequest,
} from "../lib/Api";
import { Link } from "react-router-dom";
import {
  CheckCircleIcon,
  MapPinIcon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react";
import FriendCard from "../components/FriendCard.jsx";
import NoFriendsFound from "../components/NoFriendsFound.jsx";
import { capitialize, getLanguageFlag } from "../utils/language.jsx";

const HomePage = () => {
  const queryClient = useQueryClient();

  const [OutGoingRequestsIds, setOutGoingRequestsIds] = useState(new Set());

  const { data: friendsRaw = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });
  // check if the data is an array or an object with a 'friends' property
  const friends = Array.isArray(friendsRaw)
    ? friendsRaw
    : friendsRaw.friends || [];

  const { data: recommendedData, isLoading: loadingUsers } = useQuery({
    queryKey: ["recommendedUsers"],
    queryFn: getRecommendedUsers,
    onSuccess: (data) => {
      console.debug("recommendedUsers raw:", data);
    },
    onError: (err) => {
      console.error("recommendedUsers error:", err);
    },
  });

  // extract array safely
  const recommendedUsers_Raw = recommendedData?.recommended_users || [];

  const { data: outGoingFriendReqs } = useQuery({
    queryKey: ["outGoingFriendReqs"], 
    queryFn: getOutGoingFriendReqs,
  });

  const { mutate: sendRequestMutation, isPending } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outGoingFriendReqs"] });
    },
  });
  useEffect(() => {
    const out_going_Ids = new Set();

    if (outGoingFriendReqs && outGoingFriendReqs.length > 0) {
      outGoingFriendReqs.forEach((req) => {
        // console.log(req);
        out_going_Ids.add(req.recipient._id);
      });

      setOutGoingRequestsIds(out_going_Ids);
    }
  }, [outGoingFriendReqs]);

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto space-y-10 pb-8">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {friends.map((friend) => (
              <FriendCard key={friend._id} friend={friend} />
            ))}
          </div>
        )}
        <section>
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Meet New Learners
                </h2>
                <p className="opacity-70">
                  Discover perfect language exchange partners based on your
                  profile
                </p>
              </div>
            </div>
          </div>

          {loadingUsers ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : recommendedUsers_Raw.length === 0 ? (
            <div className="card bg-base-200 p-6 text-center">
              <h3 className="font-semibold text-lg mb-2">
                No recommendations available
              </h3>
              <p className="text-base-content opacity-70">
                Check back later for new language partners!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedUsers_Raw.map((user) => {
                const hasRequestBeenSent = OutGoingRequestsIds.has(user._id);

                return (
                  <div
                    key={user._id}
                    className="card bg-base-200 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="card-body p-5 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="avatar size-16 rounded-full">
                          <img src={user.profilePic} alt={user.FullName} />
                        </div>

                        <div>
                          <h3 className="font-semibold text-lg">
                            {user.Fullname}
                          </h3>
                          {user.location && (
                            <div className="flex items-center text-xs opacity-70 mt-1">
                              <MapPinIcon className="size-3 mr-1" />
                              {user.location}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Languages with flags */}
                      <div className="flex flex-wrap gap-1.5">
                        <span className="badge badge-secondary">
                          {getLanguageFlag(user.nativeLanguage)}
                          Native: {capitialize(user.nativeLanguage)}
                        </span>
                        <span className="badge badge-outline">
                          {getLanguageFlag(user.learningLanguage)}
                          Learning: {capitialize(user.learningLanguage)}
                        </span>
                      </div>

                      {user.bio && (
                        <p className="text-sm font-semibold opacity-70 ">
                          {user.bio}
                        </p>
                      )}

                      {/* Action button */}
                      <button
                        className={`btn w-full mt-2 ${
                          hasRequestBeenSent ? "btn-disabled" : "btn-primary"
                        } `}
                        onClick={() => sendRequestMutation(user._id)}
                        disabled={hasRequestBeenSent || isPending}
                      >
                        {hasRequestBeenSent ? (
                          <>
                            <CheckCircleIcon className="size-4 mr-2" />
                            Request Sent
                          </>
                        ) : (
                          <>
                            <UsersIcon className="size-4 mr-2" />
                            Send Friend Request
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default HomePage;
