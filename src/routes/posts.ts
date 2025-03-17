import express, { Request, Response, NextFunction } from "express";
import { posts } from "../data/allPosts";
import { callbackGuard } from "../middleware/auth";

const router = express.Router();

router.get("/", callbackGuard, (req, res) => {
  let copyPosts = [...posts];
  if (req.query.userId) {
    copyPosts = copyPosts.filter(
      (item) => String(item.userId) === req.query.userId
    );
  }
  if (req.query.q) {
    copyPosts = copyPosts.filter(
      (item) =>
        item.body.includes(req.query.q as string) ||
        item.title.includes(req.query.q as string)
    );
  }

  res.json(copyPosts);
});

router.get("/:id", callbackGuard, ({ params: { id } }, res) => {
  const post = posts.find(({ id: postId }) => String(postId) === id);
  post ? res.json(post) : res.status(400).json({ message: "post not found" });
});

router.post("/", callbackGuard, ({ body: { userId, title, body } }, res) => {
  if (userId && title && body) {
    const array = posts.map((item) => item.id);
    const id = Math.max(...array) + 1;

    const newPost = {
      title,
      body,
      userId,
      id,
    };
    posts.push(newPost);
    res.status(201).json(newPost);
  } else {
    res.status(400).json({ message: "missing fields in body" });
  }
});

router.put("/:id", callbackGuard, (req, res) => {
  const post = posts.find((item) => String(item.id) === req.params.id);
  if (post) {
    if (req.body.userId && req.body.title && req.body.body) {
      post.body = req.body.body;
      post.title = req.body.title;
      post.userId = req.body.userId;
      res.json(post);
    } else {
      res.status(400).json({ message: "missing fields" });
    }
  } else {
    res.status(404).json({ message: "post not found" });
  }
});

router.patch("/:id", callbackGuard, (req, res) => {
  const post = posts.find((item) => String(item.id) === req.params.id);
  if (post) {
    if (req.body.userId || req.body.title || req.body.body) {
      post.body = req.body.body || post.body;
      post.title = req.body.title || post.title;
      post.userId = req.body.userId || post.userId;
      res.json(post);
    } else {
      res.status(400).json({ message: "missing fields" });
    }
  } else {
    res.status(404).json({ message: "post not found" });
  }
});

export default router;
