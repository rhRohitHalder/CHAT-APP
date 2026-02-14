import { Router } from "express";
import {
  get_User_login,
  get_User_logout,
  get_User_signup,
  get_User_onBoarded,
  googleLogin,
} from "../controllers/auth.controller.js";
import { protect_route } from "../middlewares/auth.middleware.js";
const router = Router();

router
  .post("/signup", get_User_signup)
  .post("/login", get_User_login)
  .post("/google", googleLogin)
  .post("/logout", get_User_logout)
  .post("/onboarding", protect_route, get_User_onBoarded)
  .get("/me", protect_route, (req, res) => {
    res.status(200).json({ user: req.user });
  });
export default router;
