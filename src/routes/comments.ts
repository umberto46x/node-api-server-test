import express, { Request, Response, NextFunction } from "express";
import { comments } from "../data/comments";

const router = express.Router();

router.get("/", (req, res) => {
  res.json(comments);
});

router.get("/:id", (req, res) => {
  const comment = comments.find((item) => String(item.id) === req.params.id);
  comment
    ? res.json(comments)
    : res.status(400).json({ message: "comment not found" });
});

export default router;
