import { axios_instance } from "./axios";

// Function to handle signup request
async function signupUser(userData) {
  const res = await axios_instance.post("/auth/signup", userData);
  return res.data;
}

async function loginUser(loginData) {
  const res = await axios_instance.post("/auth/login", loginData);
  return res.data;
}
async function logoutUser() {
  const res = await axios_instance.post("/auth/logout");
  return res.data;
}

async function getAuthUser() {
  try {
    const res = await axios_instance.get("/auth/me");
    return res.data;
  } catch (error) {
    // Don't throw error for 401 - it's expected when user is not logged in
    if (error.response?.status !== 401) {
      console.error("Authentication check failed:", error);
    }
    return { user: null };
  }
}

async function complete_onBoadring(userData) {
  const res = await axios_instance.post("/auth/onboarding", userData);
  return res.data;
}

async function getRecommendedUsers() {
  const res = await axios_instance.get("/users");
  // console.log("Recommended users:", res.data);
  return res.data;
}
async function getUserFriends() {
  const res = await axios_instance.get("/users/friends");
  return res.data;
}
async function getOutGoingFriendReqs() {
  const res = await axios_instance.get("/users/outgoing-frnd-rqst");
  return res.data;
}
async function sendFriendRequest(userId) {
  const res = await axios_instance.post(`/users/friend-rqst/${userId}`);
  return res.data;
}
async function getFriendRequest() {
  const res = await axios_instance.get("/users/friend-rqst");
  return res.data;
}
async function acceptFriendRequest(userId) {
  const res = await axios_instance.put(`users/friend-rqst/${userId}/accept`);
  return res.data;
}
async function rejectFriendRequest(userId) {
  const res = await axios_instance.put(`/users/friend-rqst/${userId}/reject`);
  return res.data;
}
async function getStreamToken() {
  try {
    // console.log("Fetching token from /chat/token...");
    const res = await axios_instance.get("/chat/token");
    // console.log("Token response:", res.data.token);
    return res.data;
  } catch (error) {
    console.error("Error in getStreamToken:", error);
    throw error;
  }
}

async function updateProfile(userData) {
  const res = await axios_instance.put("/users/profile", userData);
  return res.data;
}

export {
  signupUser,
  loginUser,
  logoutUser,
  getAuthUser,
  complete_onBoadring,
  getRecommendedUsers,
  getUserFriends,
  getOutGoingFriendReqs,
  sendFriendRequest,
  getFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getStreamToken,
  updateProfile,
};
