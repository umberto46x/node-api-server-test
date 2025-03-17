import express, { Request, Response } from "express";
import { User } from "../models/User";
import { body, param, matchedData } from "express-validator";
import { v4 } from "uuid";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { callbackGuard, handleExpressValidatorError } from "../middleware/auth";
const SALT = 10;

const router = express.Router();

router.post(
  "/signup",
  body("email").trim().isEmail(),
  body("password").isStrongPassword(),
  handleExpressValidatorError,
  async (req: Request, res: Response) => {
    const { email, password } = matchedData(req);
    try {
      await User.create({
        email,
        password: await bcrypt.hash(password, SALT),
        validateEmailToken: v4(),
      });
      // MANDA LA MAIL
      res.status(201).json({ message: "User created" });
    } catch (err) {
      res.status(409).json({ message: err });
    }
  }
);

router.get(
  "/validate/:validateToken",
  param("validateToken").isUUID(),
  handleExpressValidatorError,
  async (req: Request, res: Response) => {
    const user = await User.findOneAndUpdate(
      { validateEmailToken: req.params.validateToken },
      {
        emailIsActive: true,
        validateEmailToken: undefined,
      }
    );
    if (!user) {
      res.status(404).json({ message: "invalid validate token" });
      return;
    }
    res.json({ message: "email has been validated" });
  }
);

router.post(
  "/login",
  body("email").trim().isEmail(),
  body("password").isStrongPassword(),
  handleExpressValidatorError,
  async (req: Request, res: Response) => {
    const { email, password } = matchedData(req);
    const user = await User.findOne({ email }).select("email _id");
    if (!user || (await !bcrypt.compare(password, user.password))) {
      res.status(401).json({ message: "invalid credentials" });
      return;
    }
    try {
      res.json({
        accessToken: jwt.sign(
          { user },
          process.env.MY_SECRET_JWT_KEY as string
        ),
      });
    } catch (err) {
      console.log(err);
    }
  }
);

router.post(
  "/auth/request-reset-password",
  body("email").trim().isEmail(),
  handleExpressValidatorError,
  async (req: Request, res: Response) => {
    const { email } = matchedData(req);
    const user = await User.findOneAndUpdate(
      { email },
      { validateEmailToken: v4() }
    );
    if (!user) {
      res.status(404).json({ message: "user not found" });
      return;
    }
    if (process.env.current !== "test") {
      // INVIO MAIL
    }

    res.json({ message: "request send" });
  }
);

router.patch(
  "/confirm-reset-password/:validateEmailToken",
  param("validateEmailToken").isUUID(),
  body("password").isStrongPassword(),
  handleExpressValidatorError,
  async (
    { params: { validateEmailToken }, body: { password } }: Request,
    res: Response
  ) => {
    const user = await User.findOneAndUpdate(
      { validateEmailToken },
      {
        password: await bcrypt.hash(password, SALT),
        validateEmailToken: undefined,
      }
    );
    if (!user) {
      res.status(404).json({ message: "Invalid token" });
      return;
    }
    res.json({ message: "password has been updated" });
  }
);

router.get("/me", callbackGuard, (_: Request, res: Response) => {
  res.json(res.locals.user);
});

export default router;
