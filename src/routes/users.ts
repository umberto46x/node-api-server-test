import express from "express";
import { User } from "../models/User";

const router = express.Router();

router.get("/", async (req, res) => {
  const users = await User.find(
    Object.entries(req.query).length > 0 ? req.query : {}
  );
  res.json(users);
});

router.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

router.delete("/:id", async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

router.post("/", async ({ body: { name, surname, age } }, res) => {
  const user = await User.create({
    name,
    surname,
    age,
  });
  const userSaved = await user.save();
  res.status(201).json(userSaved);
});

export default router;
