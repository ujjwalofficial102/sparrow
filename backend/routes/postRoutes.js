import express from "express";
import { protectRoute } from "../middlewares/protectRoute.js";
import {
  commentOnPost,
  createPost,
  deletePost,
  getAllPosts,
  getFollowingPosts,
  getLikedPosts,
  getUserPosts,
  likeUnlikePost,
} from "../controllers/postController.js";

const router = express.Router();

router.get("/all", protectRoute, getAllPosts);
router.get("/likedposts/:userId", protectRoute, getLikedPosts);
router.get("/followingposts", protectRoute, getFollowingPosts);
router.get("/user/:username", protectRoute, getUserPosts);
router.post("/create", protectRoute, createPost);
router.post("/like/:id", protectRoute, likeUnlikePost);
router.post("/comment/:id", protectRoute, commentOnPost);
router.delete("/delete/:id", protectRoute, deletePost);

export default router;
