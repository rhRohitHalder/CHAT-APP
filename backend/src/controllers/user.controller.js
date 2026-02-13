import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";

async function get_Recommended_Users(req, res) {
  try {
    const currentUser = req.user;
    const currentUserId = req.user._id;
    const recommendedUsers = await User.find({
      $and: [
        { _id: { $ne: currentUserId } }, // exclude current user
        { _id: { $nin: currentUser.friends } }, // exclude current user's friends
      ],
      isOnboarded: true,
    }).select("-password -email -isOnboarded -createdAt -updatedAt -__v"); // Exclude sensitive fields

    res.status(200).json({ recommended_users: recommendedUsers });
  } catch (error) {
    console.error("Error fetching recommended users:", error);
    res.status(500).json({ message: "Server error" });
  }
}

async function get_My_Friends(req, res) {
  try {
    const user = await User.findById(req.user._id)
      .select("friends")
      .populate(
        "friends",
        "-password -email -isOnboarded -createdAt -updatedAt -__v"
      );

    res.status(200).json({ friends: user.friends });
  } catch (error) {
    console.error("Error fetching friends:", error);
    res.status(500).json({ message: "Server error" });
  }
}
// to send a friend request to another user
async function send_friend_request(req, res) {
  // the id of the user to whom the request is to be sent is in req.params.id
  try {
    const myId = req.user._id;
    const recipientId = req.params.id;
    //prevent sending request to oneself
    if (myId === recipientId) {
      return res
        .status(400)
        .json({ message: "You cannot send a friend request to yourself." });
    }
    const recipieint = await User.findById(recipientId);
    if (!recipieint)
      return res.status(404).json({ message: "recipient/user not found" });
    // Check if they are already friends
    if (recipieint.friends.includes(myId)) {
      return res
        .status(400)
        .json({ message: "You are already friends with this user." });
    }
    //check is a rqst is already exixting between the two users
    const ExistingRqst = await FriendRequest.findOne({
      $or: [
        { sender: myId, recipient: recipientId },
        { sender: recipientId, recipient: myId },
      ],
    });
    if (ExistingRqst) {
      return res.status(400).json({
        message:
          "A friend request is already pending between you and this user.",
      });
    }
    const friendRequest = await FriendRequest.create({
      sender: myId,
      recipient: recipientId,
    });

    res
      .status(201)
      .json({ message: "Friend request sent successfully.", friendRequest });
  } catch (error) {
    console.error("Error sending friend request:", error);
    res.status(500).json({ message: "Server error" });
  }
}
// to accept a friend request from another user
async function accept_friend_request(req, res) {
  // the id of the user whose request is to be accepted is in req.params.id
  try {
    const requestId = req.params.id; // ID of the friend request
    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest)
      return res.status(404).json({ message: "Friend request not found" });
    //verify if the current user is recipient
    if (friendRequest.recipient.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized to accept this request" });
    }
    friendRequest.status == "accepted";
    await friendRequest.save();
    // add each user to each other's friend list
    //$addToSet:add element to set element to an array if they are not already there
    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.recipient },
    });
    await User.findByIdAndUpdate(friendRequest.recipient, {
      $addToSet: { friends: friendRequest.sender },
    });
  } catch (error) {}
}
async function get_My_FriendRequest(req, res) {
  try {
    const incoming_requests = await FriendRequest.find({
      recipient: req.user._id,
      status: "pending",
    }).populate(
      "sender",
      "Fullname profilePic nativeLanguage learningLanguage location"
    );
    const accepted_requests = await FriendRequest.find({
      recipient: req.user._id,
      status: "accepted",
    }).populate(
      "recipient",
      "Fullname profilePic nativeLanguage learningLanguage location"
    );
    res.status(200).json({
      incoming_requests,
      accepted_requests,
    });
  } catch (error) {
    console.error("Error fetching friend requests:", error);
    res.status(500).json({ message: "Server error" });
  }
}
async function get_Outgoing_FriendRequest(req, res) {
  try {
    const outgoing_requests = await FriendRequest.find({
      sender: req.user._id,
      status: "pending",
    }).populate(
      "recipient",
      "fullname profilePic nativeLanguage learningLanguage location"
    );
    res.status(200).json(outgoing_requests);
  } catch (error) {
    console.error("Error fetching outgoing friend requests:", error);
    res.status(500).json({ message: "Server error" });
  }
}
async function Reject_friend_request(req, res) {
  // the id of the user whose request is to be accepted is in req.params.id
  try {
    const requestId = req.params.id; // ID of the friend request
    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest)
      return res.status(404).json({ message: "Friend request not found" });
    //verify if the current user is recipient
    if (friendRequest.recipient.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized to accept this request" });
    }
    friendRequest.status == "rejected";
    await friendRequest.save();
    res.status(200).json({ message: "Friend request rejected successfully." });
  } catch (error) {
    console.error("Error rejecting friend request:", error);
    res.status(500).json({ message: "Server error" });
  }
}
export {
  get_Recommended_Users,
  get_My_Friends,
  send_friend_request,
  accept_friend_request,
  Reject_friend_request,
  get_My_FriendRequest,
  get_Outgoing_FriendRequest,
};
