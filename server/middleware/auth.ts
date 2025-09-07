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

  console.log('🔐 Auth middleware - Request details:', {
    method: req.method,
    path: req.path,
    hasAuthHeader: !!authHeader,
    hasToken: !!token,
    tokenPreview: token ? `${token.substring(0, 20)}...` : 'Missing'
  });

  if (!token) {
    console.log('❌ Auth middleware - No token provided');
    return res.status(401).json({ 
      message: "Access token required",
      error: "MISSING_TOKEN",
      path: req.path
    });
  }

  if (!SUPABASE_JWT_SECRET || SUPABASE_JWT_SECRET === "your-jwt-secret-here") {
    console.error('❌ Auth middleware - Invalid JWT Secret configuration');
    return res.status(500).json({ 
      message: "Authentication service misconfigured",
      error: "INVALID_JWT_SECRET"
    });
  }

  try {
    const decoded = jwt.verify(token, SUPABASE_JWT_SECRET) as any;
    
    // Validate token structure
    if (!decoded.sub || !decoded.email) {
      console.error('❌ Auth middleware - Invalid token structure:', {
        hasSub: !!decoded.sub,
        hasEmail: !!decoded.email,
        aud: decoded.aud
      });
      return res.status(403).json({ 
        message: "Invalid token structure",
        error: "INVALID_TOKEN_STRUCTURE"
      });
    }

    req.user = {
      id: decoded.sub,
      email: decoded.email,
      aud: decoded.aud,
      role: decoded.role || 'authenticated',
      user_metadata: decoded.user_metadata,
    };

    console.log('✅ Auth middleware - User authenticated:', {
      id: req.user.id,
      email: req.user.email,
      aud: req.user.aud,
      role: req.user.role
    });
    
    next();
  } catch (error) {
    console.error("❌ Auth middleware - Token verification error:", {
      error: error instanceof Error ? error.message : 'Unknown error',
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'No token'
    });

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ 
        message: "Token expired",
        error: "TOKEN_EXPIRED"
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(403).json({ 
        message: "Invalid token",
        error: "INVALID_TOKEN"
      });
    }

    return res.status(403).json({ 
      message: "Token verification failed",
      error: "TOKEN_VERIFICATION_FAILED"
    });
  }
};

export const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  console.log('🔓 Optional auth middleware - Token present:', !!token);

  if (!token) {
    // No token provided, continue without user
    console.log('🔓 Optional auth - No token, continuing without user');
    next();
    return;
  }

  if (!SUPABASE_JWT_SECRET || SUPABASE_JWT_SECRET === "your-jwt-secret-here") {
    console.error('❌ Optional auth middleware - Invalid JWT Secret configuration');
    // Continue without user instead of failing
    next();
    return;
  }

  try {
    const decoded = jwt.verify(token, SUPABASE_JWT_SECRET) as any;
    
    if (decoded.sub && decoded.email) {
      req.user = {
        id: decoded.sub,
        email: decoded.email,
        aud: decoded.aud,
        role: decoded.role || 'authenticated',
        user_metadata: decoded.user_metadata,
      };
      console.log('✅ Optional auth - User authenticated:', req.user.email);
    } else {
      console.log('⚠️ Optional auth - Invalid token structure, continuing without user');
    }
  } catch (error) {
    console.log('⚠️ Optional auth - Token verification failed, continuing without user:', 
      error instanceof Error ? error.message : 'Unknown error');
    // Invalid token, but continue without user
  }
  
  next();
};

export type { AuthenticatedRequest };