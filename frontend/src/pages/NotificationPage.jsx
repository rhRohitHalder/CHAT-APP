import React, { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { acceptFriendRequest, getFriendRequest } from "../lib/Api";
import NoNotificationsFound from "./NoNotificationFound";
import { 
  UserCheckIcon, 
  BellIcon, 
  MessageSquareIcon, 
  ClockIcon,
  UsersIcon 
} from "lucide-react";
import { Link } from "react-router-dom";
import useNotificationStore from "../store/useNotificationStore";

const NotificationPage = () => {
  const queryClient = useQueryClient();
  const { data: friend_Requests, isLoading } = useQuery({
    queryKey: ["friendRequest"],
    queryFn: getFriendRequest,
  });

  const { 
    messageNotifications, 
    clearMessageNotifications, 
    removeNotification 
  } = useNotificationStore();

  const { mutate: acceptFriendRequestMutation, isPending } = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequest"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
  });

  const incomingFriendRequests = friend_Requests?.incoming_requests || [];
  const acceptedFriendRequests = friend_Requests?.accepted_requests || [];

  const messageNotificationsOnly = messageNotifications.filter(n => n.type === "message");

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto space-y-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Notifications
          </h2>
          <Link to="/friends" className="btn btn-outline btn-sm">
            <UsersIcon className="mr-2 size-4" />
            View Friends
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : (
          <>
            {/* Message Notifications */}
            {messageNotificationsOnly.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageSquareIcon className="h-6 w-6 text-primary" />
                    <div>
                      <h3 className="text-xl font-semibold">
                        Messages
                      </h3>
                      <p className="text-sm opacity-70">
                        Recent messages from your contacts
                      </p>
                    </div>
                    <span className="badge badge-primary">
                      {messageNotificationsOnly.length}
                    </span>
                  </div>
                  <button 
                    onClick={clearMessageNotifications}
                    className="btn btn-ghost btn-sm"
                  >
                    Clear all
                  </button>
                </div>

                <div className="space-y-3">
                  {messageNotificationsOnly.slice(0, 10).map((notification) => (
                    <Link
                      key={notification.id}
                      to={`/chat/${notification.senderId}`}
                      onClick={() => removeNotification(notification.id)}
                      className="card bg-base-200 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="card-body p-4">
                        <div className="flex items-center gap-3">
                          <div className="avatar size-10 rounded-full">
                            <img
                              src={notification.senderImage || "/default-avatar.png"}
                              alt={notification.senderName}
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">
                              {notification.senderName}
                            </h4>
                            <p className="text-sm opacity-70 truncate">
                              {notification.message}
                            </p>
                          </div>
                          <MessageSquareIcon className="size-4 text-primary" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Friend Requests */}
            {incomingFriendRequests.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <UserCheckIcon className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="text-xl font-semibold">
                      Friend Requests
                    </h3>
                    <p className="text-sm opacity-70">
                      People who want to connect with you
                    </p>
                  </div>
                  <span className="badge badge-primary">
                    {incomingFriendRequests.length}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {incomingFriendRequests.map((request) => (
                    <div
                      key={request._id}
                      className="card bg-base-200 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="card-body p-5 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="avatar size-14 rounded-full">
                            <img
                              src={request.sender.profilePic}
                              alt={request.sender.Fullname}
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg">
                              {request.sender.Fullname}
                            </h4>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              <span className="badge badge-secondary badge-sm">
                                Native: {request.sender.nativeLanguage}
                              </span>
                              <span className="badge badge-outline badge-sm">
                                Learning: {request.sender.learningLanguage}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          className="btn btn-primary w-full"
                          onClick={() =>
                            acceptFriendRequestMutation(request._id)
                          }
                          disabled={isPending}
                        >
                          <UserCheckIcon className="size-4 mr-2" />
                          Accept Request
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* New Connections */}
            {acceptedFriendRequests.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <BellIcon className="h-6 w-6 text-success" />
                  <div>
                    <h3 className="text-xl font-semibold">
                      New Connections
                    </h3>
                    <p className="text-sm opacity-70">
                      Your recent friend acceptances
                    </p>
                  </div>
                  <span className="badge badge-success">
                    {acceptedFriendRequests.length}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {acceptedFriendRequests.map((notification) => (
                    <div
                      key={notification._id}
                      className="card bg-base-200 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="card-body p-5 space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="avatar size-12 rounded-full">
                            <img
                              src={notification.recipient.profilePic}
                              alt={notification.recipient.Fullname}
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg">
                              {notification.recipient.Fullname}
                            </h4>
                            <p className="text-sm opacity-70 mt-1">
                              Accepted your friend request
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="badge badge-success badge-sm">
                                <MessageSquareIcon className="h-3 w-3 mr-1" />
                                New Friend
                              </span>
                              <span className="text-xs opacity-60 flex items-center">
                                <ClockIcon className="h-3 w-3 mr-1" />
                                Recently
                              </span>
                            </div>
                          </div>
                        </div>

                        <Link 
                          to={`/chat/${notification.recipient._id}`}
                          className="btn btn-outline btn-sm w-full"
                        >
                          <MessageSquareIcon className="size-4 mr-2" />
                          Start Chat
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {incomingFriendRequests.length === 0 && 
             acceptedFriendRequests.length === 0 && 
             messageNotificationsOnly.length === 0 && <NoNotificationsFound />}
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;