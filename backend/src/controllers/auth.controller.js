import { UpsertStreamUser } from "../lib/stream.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

async function get_User_signup(req, res) {
  const { Fullname, email, password } = req.body;
  try {
    //checking validations
    if (!Fullname || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // password validation
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    // email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // profile-picture
    const idx = Math.floor(Math.random() * 100) + 1; // Random number between 1 and 100
    const random_profilePic = `https://avatar.iran.liara.run/public/${idx}`;

    // newUser creation
    const newUser = await User.create({
      Fullname,
      email,
      password,
      profilePic: random_profilePic,
    });

    //create user in stream as well
    try {
      await UpsertStreamUser({
        // userId: newUser._id.toString(),
        id: newUser._id.toString(), // <-- changed from userId to id
        name: newUser.Fullname,
        profilePic: newUser.profilePic || "",
      });
      console.log(`Stream user created for ${newUser.Fullname}`);
    } catch (error) {
      console.log("Error creating Stream user:", error);
    }

    // token - jwt
    const token = jwt.sign({ UserId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // send token in HTTP-only cookie
    // res.cookie("_jwt", token, {
    //   maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    //   httpOnly: true, // cookie not accessible via client-side JS - prevent XSS attacks
    //   sameSite: "strict", // CSRF protection
    //   secure: process.env.NODE_ENV === "production", // cookie only sent over HTTPS in production
    // });
    res.cookie("_jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true, // cookie not accessible via client-side JS - prevent XSS attacks
      sameSite: process.env.NODE_ENV === "production" ? 'strict' : 'lax', // Use 'lax' in development for cross-origin requests
      secure: process.env.NODE_ENV === "production", // cookie only sent over HTTPS in production
      path: "/" // Ensure the cookie is sent for all paths
    });
    res.status(201).json({ succcess: true, user: newUser, token });
  } catch (error) {
    console.log("Error in signup:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
async function get_User_login(req, res) {
  try {
    const { email, password } = req.body;
    //checking validations
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    // token - jwt
    const token = jwt.sign({ UserId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // send token in HTTP-only cookie
    res.cookie("_jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true, // cookie not accessible via client-side JS - prevent XSS attacks
      sameSite: "strict", // CSRF protection
      secure: process.env.NODE_ENV === "production", // cookie only sent over HTTPS in production
    });
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log("Error in login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
function get_User_logout(req, res) {
  res.clearCookie("_jwt");
  res.status(200).json({ message: "Logged out successfully" });
}
async function get_User_onBoarded(req, res) {
  try {
    const userId = req.user._id;
    const { Fullname, bio, nativeLanguage, learningLanguage, location } =
      req.body;
    // validations
    if (
      !Fullname ||
      !bio ||
      !nativeLanguage ||
      !learningLanguage ||
      !location
    ) {
      return res.status(400).json({
        message: "All fields are required",
        missingFields: [
          !Fullname && "Fullname",
          !bio && "bio",
          !nativeLanguage && "nativeLanguage",
          !learningLanguage && "learningLanguage",
          !location && "location",
        ].filter(Boolean),
      });
    }
    const Updated_user = await User.findByIdAndUpdate(
      userId,
      {
        ...req.body,
        isOnboarded: true,
      },
      {
        new: true,
      }
    );

    if (!Updated_user) {
      return res.status(404).json({ message: "User not found" });
    }

    // update todo user info in stream as well
    try {
      await UpsertStreamUser({
        id: Updated_user._id?.toString(),
        name: Updated_user.Fullname || "",
        profilePic: Updated_user.profilePic || "",
      });
      console.log(`Stream user updated for ${Updated_user.Fullname}`);
    } catch (error) {
      console.error("Error updating Stream user:", error); // Log full error object
    }

    res.status(200).json({ success: true, user: Updated_user });
  } catch (error) {
    console.log("Error in onboarding:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export { get_User_signup, get_User_login, get_User_logout, get_User_onBoarded };
