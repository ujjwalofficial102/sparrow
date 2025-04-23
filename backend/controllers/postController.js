import User from "../models/user-model.js";
import Post from "../models/post-model.js";
import Notification from "../models/notification-model.js";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });
    if (!posts) {
      return res.status(200).json([]);
    }
    res.status(200).json({ success: true, posts });
  } catch (error) {
    console.log("Error in getAllPosts:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const createPost = async (req, res) => {
  let { text, img } = req.body;
  text = text.trim();
  if (!text && !img) {
    return res.status(400).json({
      success: false,
      message: "Please provide text or image for the post",
    });
  }
  try {
    const userId = req.user._id.toString();
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (img) {
      const uploadedResponse = await cloudinary.uploader.upload(img);
      img = uploadedResponse.secure_url;
    }
    const newPost = await Post.create({
      user: userId,
      text,
      img,
    });
    res.status(201).json({
      success: true,
      newPost,
    });
  } catch (error) {
    console.log("Error in createPost:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const likeUnlikePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const postId = req.params.id;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        success: false,
        message: "Post ID not found",
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const isLiked = post.likes.includes(userId);
    if (isLiked) {
      await Post.findByIdAndUpdate(postId, { $pull: { likes: userId } });
      await User.findByIdAndUpdate(userId, { $pull: { likedPosts: postId } });

      const updatedLikes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
      return res.status(200).json({
        success: true,
        updatedLikes,
      });
    }
    post.likes.push(userId);
    await post.save();
    await User.findByIdAndUpdate(userId, { $push: { likedPosts: postId } });
    const notification = new Notification({
      from: userId,
      to: post.user,
      type: "like",
    });
    await notification.save();
    const updatedLikes = post.likes;
    res.status(200).json({
      success: true,
      updatedLikes,
    });
  } catch (error) {
    console.log("Error in likeUnlikePost:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const commentOnPost = async (req, res) => {
  try {
    const postId = req.params.id;
    if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        success: false,
        message: "Post ID not found",
      });
    }
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(400).json({
        success: false,
        message: "Post not found",
      });
    }
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Comment text is required",
      });
    }
    post.comments.push({
      text,
      user: req.user._id,
    });
    await post.save();
    res.status(200).json({
      success: true,
      post,
    });
  } catch (error) {
    console.log("error in commentOnPost:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        success: false,
        message: "PostId not found",
      });
    }
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(400).json({
        success: false,
        message: "Post not found",
      });
    }
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this post",
      });
    }

    if (post.img) {
      // https://res.cloudinary.com/dwmxlossg/image/upload/v1744815238/b7ebeiwuvf4ymmcyzgtn.jpg
      await cloudinary.uploader.destroy(
        post.img.split("/").pop().split(".")[0]
      );
    }
    await Post.findByIdAndDelete(postId);

    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.log("Error in deletePost:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getLikedPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });
    res.status(200).json({
      success: true,
      likedPosts,
    });
  } catch (error) {
    console.log("Error in getLikedPosts:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const getFollowingPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const posts = await Post.find({ user: { $in: user.following } })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });
    res.status(200).json({
      success: true,
      posts,
    });
  } catch (error) {
    console.log("Error in getFollowingPosts:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const getUserPosts = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const userPosts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    res.status(200).json({
      success: true,
      userPosts,
    });
  } catch (error) {
    console.log("Error in getUserPosts:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
