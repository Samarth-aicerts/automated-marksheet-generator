  import { Request, Response, NextFunction } from "express";
  import jwt from "jsonwebtoken";

  interface AuthRequest extends Request {
    user?: {
      userId: string;
    };
  }

  export const authenticate = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];// extract the token from the authorization header

    try {// verify the token using the secret key and decode it to get the userId
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as { userId: string };

      req.user = decoded;

      next();
    } catch {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
  };