export { env, config, validateEnvironment, getEnvironmentConfig } from './environment';
export { createCorsConfig, getCorsOrigins, CORS_ORIGINS, CORS_CONFIG } from './cors';
export { getSecurityConfig, getCustomHeaders, CSP_DIRECTIVES } from './security';

import { env, config } from './environment';

export default {
  env,
  config
};