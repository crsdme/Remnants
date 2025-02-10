// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // const authHeader = req.headers.authorization;
  const authHeader = req.cookies.accessToken;

  if (authHeader) {
    // const token = authHeader.split(" ")[1];
    const token = authHeader;

    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
      if (err) {
        return res.sendStatus(401);
      }

      (req as any).user = decoded;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

export const refreshJWT = (req: Request, res: Response, next: NextFunction) => {
  jwt.verify(req.cookies.refreshToken, JWT_SECRET, (err: any) => {
    if (err) return res.sendStatus(403);
    next();
  });
};
