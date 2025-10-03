import jwt, { JwtPayload } from "jsonwebtoken";
import AppLogger from "./logger";
import { env } from "@/config/environment";

export interface DecodedJWT extends JwtPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
  iss: string;
  aud: string;
}

class JWTService {
  private readonly jwtSecret: string;
  private readonly expectedIssuer = "devcoll-auth-service";
  private readonly expectedAudience = "devcoll-api-gateway";

  constructor() {
    this.jwtSecret = env.JWT_SECRET || "";
  }

  public verifyInternalToken(token: string): DecodedJWT | null {
    try {
      const decoded = jwt.verify(token, this.jwtSecret, {
        issuer: this.expectedIssuer,
        audience: this.expectedAudience,
        algorithms: ["HS256"],
      }) as DecodedJWT;

      if (!decoded.userId || !decoded.email || !decoded.name || !decoded.role) {
        AppLogger.warn("JWT missing required fields", {
          hasUserId: !!decoded.userId,
          hasEmail: !!decoded.email,
          hasName: !!decoded.name,
          hasRole: !!decoded.role,
          service: "api-gateway",
          component: "jwt-service",
        });
        return null;
      }

      AppLogger.debug("JWT token verified successfully", {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        issuer: decoded.iss,
        audience: decoded.aud,
        service: "api-gateway",
        component: "jwt-service",
      });

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        AppLogger.debug("JWT token expired", {
          service: "api-gateway",
          component: "jwt-service",
        });
      } else if (error instanceof jwt.JsonWebTokenError) {
        AppLogger.debug("JWT token invalid", {
          error: error.message,
          service: "api-gateway",
          component: "jwt-service",
        });
      } else if (error instanceof jwt.NotBeforeError) {
        AppLogger.debug("JWT token not active yet", {
          service: "api-gateway",
          component: "jwt-service",
        });
      } else {
        AppLogger.warn("JWT verification failed", {
          error: error instanceof Error ? error.message : "Unknown error",
          service: "api-gateway",
          component: "jwt-service",
        });
      }
      return null;
    }
  }
}

const jwtService = new JWTService();
export default jwtService;
