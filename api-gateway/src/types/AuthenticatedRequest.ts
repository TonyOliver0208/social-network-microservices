import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    name: string;
    picture?: string;
    role: string;
  };
  internalToken?: string;
}
