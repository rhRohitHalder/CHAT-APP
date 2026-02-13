import { generateStreamToken } from "../lib/stream.js";

async function get_Stream_Token(req, res) {
  try {
    // console.log("Generating token for user:", req.user.id);
    const token = await generateStreamToken(req.user.id);
    // console.log("Generated token:", token);
    res.status(200).json({ token }); // Make sure to return an object with a token property
  } catch (error) {
    console.error("Error in get_Stream_Token:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}

export { get_Stream_Token };
