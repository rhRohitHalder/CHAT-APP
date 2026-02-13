import { Router } from "express";
import {
  get_User_login,
  get_User_logout,
  get_User_signup,
  get_User_onBoarded,
} from "../controllers/auth.controller.js";
import { protect_route } from "../middlewares/auth.middleware.js";
const router = Router();

router
  .post("/signup", get_User_signup)
  .post("/login", get_User_login)
  .post("/logout", get_User_logout)
  .post("/onboarding", protect_route, get_User_onBoarded)
  .get("/me", protect_route, (req, res) => {
    //check if user is logged in
    res.status(200).json({ user: req.user });
  });
export default router;
