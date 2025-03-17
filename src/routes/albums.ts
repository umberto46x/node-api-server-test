import express, { Request, Response, NextFunction } from "express";
import { albums } from "../data/albums";
import { callbackGuard } from "../middleware/auth";

const router = express.Router();

router.get("/", callbackGuard, (req: Request, res: Response) => {
  res.json(albums);
});

router.get("/:id", callbackGuard, (req: Request, res: Response) => {
  const album = albums.find((item) => String(item.id) === req.params.id);
  album
    ? res.json(album)
    : res.status(400).json({ message: "album not found" });
});

export default router;
