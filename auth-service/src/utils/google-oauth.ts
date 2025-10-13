import { OAuth2Client } from 'google-auth-library';
import AppLogger from './logger';
import { GoogleUserInfo } from '../types';

class GoogleOAuthService {
  private client: OAuth2Client;
  private clientId: string;

  constructor() {
    this.clientId = process.env.GOOGLE_CLIENT_ID || '';
    
    if (!this.clientId) {
      AppLogger.error('Google Client ID not configured');
      throw new Error('Google Client ID is required');
    }

    this.client = new OAuth2Client(this.clientId);
  }

  async verifyIdToken(idToken: string): Promise<GoogleUserInfo> {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: idToken,
        audience: this.clientId,
      });

      const payload = ticket.getPayload();
      
      if (!payload || !payload.email_verified) {
        throw new Error('Invalid or unverified token');
      }

      return {
        id: payload.sub,
        email: payload.email || '',
        name: payload.name || '',
        picture: payload.picture || ''
      };
    } catch (error) {
      AppLogger.error('Google token verification failed:', { error: error instanceof Error ? error.message : String(error) });
      throw new Error('Invalid Google token');
    }
  }


}

export const googleOAuthService = new GoogleOAuthService();
export default googleOAuthService;
