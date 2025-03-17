import express, { Request, Response, NextFunction } from "express";
import {
  body,
  param,
  matchedData,
  header,
  validationResult,
} from "express-validator";

import jwt from "jsonwebtoken";

export const callbackGuard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.headers.authorization) {
    res.status(401).json({ message: "invalid access token" });
    return;
  }
  try {
    const decodedObj = jwt.verify(
      (req.headers.authorization as string).split(" ")[1],
      process.env.MY_SECRET_JWT_KEY as string
    ) as jwt.JwtPayload;
    res.locals.user = decodedObj.user;
    next();
  } catch (err) {
    res.status(401).json({ message: "invalid access token" });
    return;
  }
};

export const handleExpressValidatorError = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!validationResult(req).isEmpty()) {
    res.status(400).json({ errors: validationResult(req).array() });
    return;
  }
  next();
};
