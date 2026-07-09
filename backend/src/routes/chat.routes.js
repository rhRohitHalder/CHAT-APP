import { Router } from "express";
import { protect_route } from "../middlewares/auth.middleware.js";
import { get_Stream_Token, get_Smart_Reply_Suggestions } from "../controllers/chat.controller.js";

const router = Router();
router.use(protect_route);

router.get("/token", get_Stream_Token);
router.post("/suggestions", get_Smart_Reply_Suggestions);
export default router;
