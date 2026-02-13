import { Router } from "express";
import { protect_route } from "../middlewares/auth.middleware.js";
import {
  get_Recommended_Users,
  get_My_Friends,
  send_friend_request,
  accept_friend_request,
  Reject_friend_request,
  get_My_FriendRequest,
  get_Outgoing_FriendRequest,
} from "../controllers/user.controller.js";
const router = Router();

//apply protect_route middleware to all routes
router.use(protect_route);

router
  .get("/", get_Recommended_Users)
  .get("/friends", get_My_Friends)

  .post("/friend-rqst/:id", send_friend_request)
  .put("/friend-rqst/:id/accept", accept_friend_request)

  .put("/friend-rqst/:id/reject", Reject_friend_request) //same controller as accept, just pass different param
  .get("/friend-rqst", get_My_FriendRequest)
  .get("/outgoing-frnd-rqst", get_Outgoing_FriendRequest);

export default router;
