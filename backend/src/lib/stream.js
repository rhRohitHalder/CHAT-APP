import { StreamChat } from "stream-chat";
import "dotenv/config";

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
  throw new Error(`${apiKey || apiSecret} is not missing`);
}

const streamClient = StreamChat.getInstance(apiKey, apiSecret);

export const UpsertStreamUser = async (userData) => {
  try {
    if (!userData.id) {
      throw new Error("User ID is required in userData");
    }
    await streamClient.upsertUser(userData); // Pass single user object
    return userData;
  } catch (error) {
    console.error("Error upserting user to Stream:", error);
  }
};

export const generateStreamToken = async (UserId) => {
  try {
    const userId = UserId.toString();
    return streamClient.createToken(userId);
  } catch (error) {
    console.error("Error generating Stream token:", error);
    throw error;
  }
};
