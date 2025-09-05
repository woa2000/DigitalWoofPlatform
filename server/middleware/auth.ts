import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Supabase JWT Secret - você precisa obter isso do seu projeto Supabase
// Dashboard -> Settings -> API -> JWT Secret
const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET || "your-jwt-secret-here";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    aud: string;
    role: string;
    user_metadata?: any;
  };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, SUPABASE_JWT_SECRET) as any;
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      aud: decoded.aud,
      role: decoded.role,
      user_metadata: decoded.user_metadata,
    };
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

export const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // No token provided, continue without user
    next();
    return;
  }

  try {
    const decoded = jwt.verify(token, SUPABASE_JWT_SECRET) as any;
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      aud: decoded.aud,
      role: decoded.role,
      user_metadata: decoded.user_metadata,
    };
  } catch (error) {
    console.error("Token verification error:", error);
    // Invalid token, but continue without user
  }
  
  next();
};

export type { AuthenticatedRequest };