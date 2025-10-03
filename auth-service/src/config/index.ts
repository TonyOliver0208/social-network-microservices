// Re-export all configuration modules for easy access
export { env, config, validateEnvironment, getEnvironmentConfig } from './environment';
export { createCorsConfig, getCorsOrigins, CORS_ORIGINS, CORS_CONFIG } from './cors';
export { getSecurityConfig, getCustomHeaders, CSP_DIRECTIVES, RATE_LIMIT_CONFIG } from './security';

// Default export for backward compatibility
import { env, config } from './environment';

export default {
  env,
  config
};
