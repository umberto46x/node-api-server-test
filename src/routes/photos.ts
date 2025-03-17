import { photos } from "../data/photos";

import express, { Request, Response, NextFunction } from "express";
import { comments } from "../data/comments";

const router = express.Router();

router.get("/", (req, res) => {
  const skip = Number(req.query.skip) || 0;
  const limit = Number(req.query.limit) || 20;
  let subPhotos = photos.filter((_, index) => index >= skip);
  subPhotos = subPhotos.filter((_, index) => index < limit);
  res.json(subPhotos);
});

router.get("/:id", (req, res) => {
  const photo = photos.find((item) => String(item.id) === req.params.id);
  photo
    ? res.json(photo)
    : res.status(400).json({ message: "photo not found" });
});

export default router;
